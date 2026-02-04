import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CartService {
  private readonly CART_TTL = 7 * 24 * 60 * 60;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  private getCartKey(userId: number): string {
    return `cart:user:${userId}`;
  }

  private async cacheCart(cart: Cart): Promise<void> {
    const cartKey = this.getCartKey(cart.userId);
    await this.redisService.setWithExpiry(cartKey, JSON.stringify(cart), this.CART_TTL);
  }

  private async getCartFromCache(userId: number): Promise<Cart | null> {
    const cartKey = this.getCartKey(userId);
    const cached = await this.redisService.get(cartKey);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  private async invalidateCache(userId: number): Promise<void> {
    const cartKey = this.getCartKey(userId);
    await this.redisService.del(cartKey);
  }

  async getCart(userId: number): Promise<Cart> {
    const cached = await this.getCartFromCache(userId);

    if (cached) {
      return cached;
    }

    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      await this.cartRepository.save(cart);
    }

    await this.cacheCart(cart);

    return cart;
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, variantId, quantity } = addToCartDto;

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let variant: ProductVariant | null = null;
    let price = product.price;

    if (variantId) {
      variant = await this.variantRepository.findOne({ where: { id: variantId, productId } });
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
      price = Number(product.price) + Number(variant.priceModifier);
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    if (variant && variant.stock < quantity) {
      throw new BadRequestException('Insufficient variant stock available');
    }

    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      await this.cartRepository.save(cart);
    }

    // Ensure items array is always defined
    if (!cart.items) {
      cart.items = [];
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variantId === (variantId || null),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        // if no variantId is provided, store null explicitly
        variantId: variantId ?? null,
        quantity,
        price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    await this.invalidateCache(userId);

    return this.getCart(userId);
  }

  async updateCartItem(userId: number, itemId: number, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productRepository.findOne({ where: { id: cartItem.productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    if (cartItem.variantId) {
      const variant = await this.variantRepository.findOne({ where: { id: cartItem.variantId } });
      if (variant && variant.stock < updateDto.quantity) {
        throw new BadRequestException('Insufficient variant stock available');
      }
    }

    cartItem.quantity = updateDto.quantity;
    await this.cartItemRepository.save(cartItem);

    await this.invalidateCache(userId);

    return this.getCart(userId);
  }

  async removeFromCart(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    await this.invalidateCache(userId);

    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (cart && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    await this.invalidateCache(userId);
  }

  async getCartTotal(userId: number): Promise<number> {
    const cart = await this.getCart(userId);

    return cart.items.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);
  }
}

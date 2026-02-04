import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { CustomerGuard } from '../auth/guards/customer.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(CustomerGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    const cart = await this.cartService.addToCart(user.userId, addToCartDto);
    return this.toCartResponse(cart);
  }

  @Get()
  async getCart(@CurrentUser() user: any) {
    const cart = await this.cartService.getCart(user.userId);
    return this.toCartResponse(cart);
  }

  @Get('total')
  async getCartTotal(@CurrentUser() user: any) {
    const total = await this.cartService.getCartTotal(user.userId);
    return { total };
  }

  @Patch('item/:id')
  async updateCartItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(user.userId, +id, updateDto);
    return this.toCartResponse(cart);
  }

  @Delete('item/:id')
  @HttpCode(HttpStatus.OK)
  async removeFromCart(@CurrentUser() user: any, @Param('id') id: string) {
    const cart = await this.cartService.removeFromCart(user.userId, +id);
    return this.toCartResponse(cart);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@CurrentUser() user: any) {
    await this.cartService.clearCart(user.userId);
    return { message: 'Cart cleared successfully' };
  }

  /**
   * Map full Cart entity to a minimal response shape
   * suitable for frontend display (no createdAt/updatedAt, etc.)
   */
  private toCartResponse(cart: any) {
    const items = cart.items ?? [];
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      total,
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        product: item.product && {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
        },
        variant: item.variant && {
          id: item.variant.id,
          name: item.variant.name,
          priceModifier: item.variant.priceModifier,
        },
      })),
    };
  }
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../email/email.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
    private readonly productService: ProductService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot create order.');
    }

    for (const cartItem of cart.items) {
      const product = await this.productService.findOne(cartItem.productId);

      if (cartItem.variantId) {
        const variant = product.variants.find(v => v.id === cartItem.variantId);
        if (!variant) {
          throw new BadRequestException(`Variant not found for product: ${product.name}`);
        }
        if (variant.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}, Requested: ${cartItem.quantity}`
          );
        }
      } else {
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`
          );
        }
      }
    }

    let totalAmount = 0;
    for (const cartItem of cart.items) {
      const product = await this.productService.findOne(cartItem.productId);
      let itemPrice = Number(product.price);

      if (cartItem.variantId) {
        const variant = product.variants.find(v => v.id === cartItem.variantId);
        if (variant) {
          itemPrice += Number(variant.priceModifier);
        }
      }

      totalAmount += itemPrice * cartItem.quantity;
    }

    const order = this.orderRepository.create({
      userId,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      paymentMethod: createOrderDto.paymentMethod,
      status: createOrderDto.status || 'pending',
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = cart.items.map(cartItem => {
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
    });
    await this.orderItemRepository.save(orderItems);

    const fullOrder = await this.findOne(savedOrder.id);

    await this.cartService.clearCart(userId);

    if (fullOrder.user?.email) {
      const orderItemsForEmail = fullOrder.orderItems?.map((item) => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
      })) || [];

      await this.emailService.sendOrderConfirmationEmail(fullOrder.user.email, {
        orderId: fullOrder.id,
        customerName: fullOrder.user.name || 'Customer',
        totalAmount: fullOrder.totalAmount,
        shippingAddress: fullOrder.shippingAddress || 'No address provided',
        items: orderItemsForEmail,
      });
    }

    return fullOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['user', 'orderItems', 'orderItems.product', 'payment'],
    });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['user', 'orderItems', 'orderItems.product', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.product', 'payment'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findOneForUser(id: number, userId: number, isAdmin: boolean): Promise<Order> {
    const order = await this.findOne(id);

    if (isAdmin) {
      return order;
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}

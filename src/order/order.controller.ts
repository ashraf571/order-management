import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CustomerGuard } from '../auth/guards/customer.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(CustomerGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.orderService.create(user.userId, createOrderDto);
  }

  @UseGuards(CustomerGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    if (user.isAdmin) {
      return this.orderService.findAll();
    }
    return this.orderService.findByUserId(user.userId);
  }

  @UseGuards(CustomerGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.findOneForUser(+id, user.userId, user.isAdmin);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @CurrentUser() user: any) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.remove(+id);
  }
}

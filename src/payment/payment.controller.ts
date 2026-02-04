import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CustomerGuard } from '../auth/guards/customer.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(CustomerGuard)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentService.createForUser(createPaymentDto, user.userId, user.isAdmin);
  }

  @UseGuards(CustomerGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    if (user.isAdmin) {
      return this.paymentService.findAll();
    }
    return this.paymentService.findByUserId(user.userId);
  }

  @UseGuards(CustomerGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentService.findOneForUser(+id, user.userId, user.isAdmin);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @CurrentUser() user: any) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentService.remove(+id);
  }
}

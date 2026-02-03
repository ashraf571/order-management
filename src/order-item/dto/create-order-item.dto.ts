import { IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

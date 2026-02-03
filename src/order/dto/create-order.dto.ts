import { IsNumber, IsString, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}

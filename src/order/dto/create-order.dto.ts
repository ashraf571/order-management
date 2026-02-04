import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  shippingAddress: string;

  @IsString()
  @IsEnum(['COD', 'credit_card'])
  paymentMethod: string;

  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;
}

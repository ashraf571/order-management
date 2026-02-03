import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['credit_card', 'debit_card', 'paypal', 'cash'])
  paymentMethod: string;

  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
}

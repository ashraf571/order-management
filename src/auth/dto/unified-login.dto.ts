import { IsString, MinLength, IsOptional } from 'class-validator';

export class UnifiedLoginDto {
  @IsString()
  identifier: string; // Can be email or phone number

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class RequestOtpUnifiedDto {
  @IsString()
  identifier: string; // Can be email or phone number
}

export class VerifyOtpUnifiedDto {
  @IsString()
  identifier: string; // Can be email or phone number

  @IsString()
  @MinLength(6)
  otp: string;
}

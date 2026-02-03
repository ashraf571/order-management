import { IsEmail, IsString, IsOptional, MinLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(['admin', 'customer'])
  @IsOptional()
  role?: string;
}

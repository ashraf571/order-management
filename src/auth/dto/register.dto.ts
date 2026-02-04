import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(15, { message: 'Password must be at most 15 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message: 'Password must contain at least 1 number, 1 capital letter, and 1 special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(['customer'])
  @IsOptional()
  role?: string;
}

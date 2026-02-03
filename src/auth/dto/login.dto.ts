import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class LoginWithPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RequestOtpDto {
  @IsEmail()
  email: string;
}

export class LoginWithOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  otp: string;
}

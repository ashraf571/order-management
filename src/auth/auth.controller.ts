import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithPasswordDto, RequestOtpDto, LoginWithOtpDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginWithPassword(@Body() loginDto: LoginWithPasswordDto) {
    return await this.authService.loginWithPassword(loginDto);
  }

  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return await this.authService.requestOtp(requestOtpDto.email);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginDto: LoginWithOtpDto) {
    return await this.authService.loginWithOtp(loginDto);
  }
}

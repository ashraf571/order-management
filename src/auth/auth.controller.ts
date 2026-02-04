import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithPasswordDto, RequestOtpDto, LoginWithOtpDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnifiedLoginDto, RequestOtpUnifiedDto, VerifyOtpUnifiedDto } from './dto/unified-login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('login/password')
  @HttpCode(HttpStatus.OK)
  async loginUnified(@Body() loginDto: UnifiedLoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('login/otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtpUnified(@Body() requestDto: RequestOtpUnifiedDto) {
    return await this.authService.requestOtpUnified(requestDto);
  }

  @Public()
  @Post('login/otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtpUnified(@Body() verifyDto: VerifyOtpUnifiedDto) {
    return await this.authService.verifyOtpUnified(verifyDto);
  }

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

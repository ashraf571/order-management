import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithPasswordDto, RequestOtpDto, LoginWithOtpDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnifiedLoginDto, RequestOtpUnifiedDto, VerifyOtpUnifiedDto } from './dto/unified-login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================
  // NEW UNIFIED ENDPOINTS (Recommended)
  // ============================================

  /**
   * Register a new user
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Unified login with email/phone + password
   * POST /auth/login/password
   * Body: { identifier: "email@example.com" OR "1234567890", password: "password123" }
   */
  @Public()
  @Post('login/password')
  @HttpCode(HttpStatus.OK)
  async loginUnified(@Body() loginDto: UnifiedLoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Request OTP for email or phone
   * POST /auth/login/otp/request
   * Body: { identifier: "email@example.com" OR "1234567890" }
   */
  @Public()
  @Post('login/otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtpUnified(@Body() requestDto: RequestOtpUnifiedDto) {
    return await this.authService.requestOtpUnified(requestDto);
  }

  /**
   * Verify OTP and login
   * POST /auth/login/otp/verify
   * Body: { identifier: "email@example.com" OR "1234567890", otp: "123456" }
   */
  @Public()
  @Post('login/otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtpUnified(@Body() verifyDto: VerifyOtpUnifiedDto) {
    return await this.authService.verifyOtpUnified(verifyDto);
  }

  // ============================================
  // LEGACY ENDPOINTS (For backward compatibility)
  // ============================================

  /**
   * @deprecated Use POST /auth/login/password instead
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginWithPassword(@Body() loginDto: LoginWithPasswordDto) {
    return await this.authService.loginWithPassword(loginDto);
  }

  /**
   * @deprecated Use POST /auth/login/otp/request instead
   */
  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return await this.authService.requestOtp(requestOtpDto.email);
  }

  /**
   * @deprecated Use POST /auth/login/otp/verify instead
   */
  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginDto: LoginWithOtpDto) {
    return await this.authService.loginWithOtp(loginDto);
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { OtpService } from './services/otp.service';
import { LoginWithPasswordDto, LoginWithOtpDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Login with email and password
   */
  async loginWithPassword(loginDto: LoginWithPasswordDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Request OTP for login
   */
  async requestOtp(email: string): Promise<{ message: string; expiresIn: number }> {
    const otp = await this.otpService.generateAndStoreOtp(email);
    const expiresIn = await this.otpService.getOtpExpiry(email);

    return {
      message: 'OTP sent successfully',
      expiresIn,
    };
  }

  /**
   * Login with email and OTP
   */
  async loginWithOtp(loginDto: LoginWithOtpDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify OTP
    const isOtpValid = await this.otpService.verifyOtp(loginDto.email, loginDto.otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Generate JWT token and return auth response
   */
  private async generateAuthResponse(user: any): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: number) {
    return await this.userService.findOne(userId);
  }
}

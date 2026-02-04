import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { OtpService } from './services/otp.service';
import { EmailService } from '../email/email.service';
import { LoginWithPasswordDto, LoginWithOtpDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnifiedLoginDto, RequestOtpUnifiedDto, VerifyOtpUnifiedDto } from './dto/unified-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}


  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUserByEmail = await this.userService.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('User already exists with this email');
    }

    if (registerDto.phone) {
      const existingUserByPhone = await this.userService.findByPhone(registerDto.phone);
      if (existingUserByPhone) {
        throw new ConflictException('User already exists with this phone number');
      }
    }

    if (registerDto.role && registerDto.role !== 'customer') {
      throw new BadRequestException('You can only register as a customer');
    }

    const { role, ...userData } = registerDto;
    const user = await this.userService.create(userData);

    if (user.email) {
      this.emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    return this.generateAuthResponse(user);
  }


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

  async requestOtp(email: string): Promise<{ message: string; expiresIn: number }> {
    await this.otpService.generateAndStoreOtp(email);
    const expiresIn = await this.otpService.getOtpExpiry(email);

    return {
      message: 'OTP sent successfully',
      expiresIn,
    };
  }

  async loginWithOtp(loginDto: LoginWithOtpDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.otpService.verifyOtp(loginDto.email, loginDto.otp);

    return this.generateAuthResponse(user);
  }

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

  async login(loginDto: UnifiedLoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmailOrPhone(loginDto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!loginDto.password) {
      throw new BadRequestException('Password is required');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password login not available for this user');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async requestOtpUnified(requestDto: RequestOtpUnifiedDto): Promise<{ message: string; expiresIn: number; sentTo: string }> {
    const user = await this.userService.findByEmailOrPhone(requestDto.identifier);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.otpService.generateAndStoreOtp(requestDto.identifier);
    const expiresIn = await this.otpService.getOtpExpiry(requestDto.identifier);

    const isEmail = requestDto.identifier.includes('@');

    return {
      message: 'OTP sent successfully',
      expiresIn,
      sentTo: isEmail ? 'email' : 'phone',
    };
  }


  async verifyOtpUnified(verifyDto: VerifyOtpUnifiedDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmailOrPhone(verifyDto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.otpService.verifyOtp(verifyDto.identifier, verifyDto.otp);

    return this.generateAuthResponse(user);
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: number) {
    return await this.userService.findOne(userId);
  }
}

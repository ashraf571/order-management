import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_SECONDS = 60; // 1 minute

  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  /**
   * Generate a 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Get Redis keys for OTP management
   */
  private getOtpKey(email: string): string {
    return `otp:${email}`;
  }

  private getAttemptsKey(email: string): string {
    return `otp:attempts:${email}`;
  }

  private getCooldownKey(email: string): string {
    return `otp:cooldown:${email}`;
  }

  /**
   * Check if user is in cooldown period
   */
  async checkCooldown(email: string): Promise<{ inCooldown: boolean; remainingSeconds?: number }> {
    const cooldownKey = this.getCooldownKey(email);
    const exists = await this.redisService.exists(cooldownKey);
    
    if (!exists) {
      return { inCooldown: false };
    }

    const remainingSeconds = await this.redisService.ttl(cooldownKey);
    return { inCooldown: true, remainingSeconds };
  }

  /**
   * Check and increment login attempts
   */
  async checkAndIncrementAttempts(email: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(email);
    const attempts = await this.redisService.increment(attemptsKey);

    // Set expiry for attempts counter (reset after cooldown period)
    if (attempts === 1) {
      await this.redisService.setWithExpiry(attemptsKey, attempts.toString(), this.COOLDOWN_SECONDS);
    }

    if (attempts > this.MAX_ATTEMPTS) {
      // Set cooldown
      const cooldownKey = this.getCooldownKey(email);
      await this.redisService.setWithExpiry(cooldownKey, '1', this.COOLDOWN_SECONDS);
      
      // Reset attempts counter
      await this.redisService.del(attemptsKey);
      
      throw new HttpException(
        `Too many failed attempts. Please wait ${this.COOLDOWN_SECONDS} seconds before trying again.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Reset attempts counter on successful login
   */
  async resetAttempts(email: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(email);
    await this.redisService.del(attemptsKey);
  }

  /**
   * Generate and store OTP for user
   */
  async generateAndStoreOtp(email: string): Promise<string> {
    // Verify user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check cooldown
    const cooldown = await this.checkCooldown(email);
    if (cooldown.inCooldown) {
      throw new HttpException(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting a new OTP.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpKey = this.getOtpKey(email);

    // Store OTP with expiry
    await this.redisService.setWithExpiry(otpKey, otp, this.OTP_EXPIRY_SECONDS);

    // Reset attempts when new OTP is generated
    await this.resetAttempts(email);

    // TODO: Send OTP via email/SMS service
    // For now, we'll log it (remove in production)
    console.log(`OTP for ${email}: ${otp}`);

    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpKey = this.getOtpKey(email);
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp) {
      await this.checkAndIncrementAttempts(email);
      return false;
    }

    if (storedOtp !== otp) {
      await this.checkAndIncrementAttempts(email);
      return false;
    }

    // OTP is valid, delete it and reset attempts
    await this.redisService.del(otpKey);
    await this.resetAttempts(email);

    return true;
  }

  /**
   * Get remaining OTP expiry time
   */
  async getOtpExpiry(email: string): Promise<number> {
    const otpKey = this.getOtpKey(email);
    return await this.redisService.ttl(otpKey);
  }
}

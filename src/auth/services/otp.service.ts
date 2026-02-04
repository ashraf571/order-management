import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { randomInt } from 'crypto';
import { RedisService } from '../../redis/redis.service';
import { UserService } from '../../user/user.service';
import { OtpDeliveryService } from './otp-delivery.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_SECONDS = 60; // 1 minute

  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly otpDeliveryService: OtpDeliveryService,
  ) {}


  private generateOtp(length: number = 6): string {
    const max = Math.pow(10, length);
    const min = Math.pow(10, length - 1);

    const otp = randomInt(min, max);

    return otp.toString();
  }

  private getOtpKey(email: string): string {
    return `otp:${email}`;
  }

  private getAttemptsKey(email: string): string {
    return `otp:attempts:${email}`;
  }

  private getCooldownKey(email: string): string {
    return `otp:cooldown:${email}`;
  }

  async checkCooldown(email: string): Promise<{ inCooldown: boolean; remainingSeconds?: number }> {
    const cooldownKey = this.getCooldownKey(email);
    const exists = await this.redisService.exists(cooldownKey);
    
    if (!exists) {
      return { inCooldown: false };
    }

    const remainingSeconds = await this.redisService.ttl(cooldownKey);
    return { inCooldown: true, remainingSeconds };
  }

  async checkAndIncrementAttempts(email: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(email);
    const attempts = await this.redisService.increment(attemptsKey);

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

  async resetAttempts(email: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(email);
    await this.redisService.del(attemptsKey);
  }

  async generateAndStoreOtp(identifier: string): Promise<string> {
    // Verify user exists
    const user = await this.userService.findByEmailOrPhone(identifier);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check cooldown
    const cooldown = await this.checkCooldown(identifier);
    if (cooldown.inCooldown) {
      throw new HttpException(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting a new OTP.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpKey = this.getOtpKey(identifier);

    // Store OTP with expiry
    await this.redisService.setWithExpiry(otpKey, otp, this.OTP_EXPIRY_SECONDS);

    // Reset attempts when new OTP is generated
    await this.resetAttempts(identifier);

    // Send OTP via email or SMS/WhatsApp
    await this.otpDeliveryService.sendOtp(identifier, otp);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpKey = this.getOtpKey(email);
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp) {
      await this.checkAndIncrementAttempts(email);
      throw new BadRequestException('OTP has expired or does not exist. Please request a new OTP.');
    }

    if (storedOtp !== otp) {
      const attemptsKey = this.getAttemptsKey(email);
      const currentAttempts = parseInt(await this.redisService.get(attemptsKey) || '0');
      const remainingAttempts = this.MAX_ATTEMPTS - currentAttempts;

      await this.checkAndIncrementAttempts(email);

      throw new BadRequestException(
        `Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`
      );
    }

    await this.redisService.del(otpKey);
    await this.resetAttempts(email);

    return true;
  }

  async getOtpExpiry(email: string): Promise<number> {
    const otpKey = this.getOtpKey(email);
    return await this.redisService.ttl(otpKey);
  }
}

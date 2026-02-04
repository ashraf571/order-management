import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Send OTP via Email using Resend
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    this.logger.log(`Sending OTP to email: ${email}`);
    await this.emailService.sendOtpEmail(email, otp);
  }

  /**
   * Send OTP via SMS
   * TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
   */
  async sendOtpSms(phone: string, otp: string): Promise<void> {
    console.log(`📱 Sending OTP to phone: ${phone}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`⏰ Expires in: 5 minutes`);

    // TODO: Implement actual SMS sending
    // Example with Twilio:
    /*
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phone,
    });
    */
  }

  /**
   * Send OTP via WhatsApp
   * TODO: Integrate with WhatsApp Business API (Twilio, 360dialog, etc.)
   */
  async sendOtpWhatsApp(phone: string, otp: string): Promise<void> {
    console.log(`💬 Sending OTP to WhatsApp: ${phone}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`⏰ Expires in: 5 minutes`);

    // TODO: Implement actual WhatsApp sending
    // Example with Twilio WhatsApp:
    /*
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
      from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
      to: `whatsapp:${phone}`,
    });
    */
  }

  /**
   * Send OTP based on identifier type (auto-detect email or phone)
   */
  async sendOtp(identifier: string, otp: string): Promise<void> {
    const isEmail = identifier.includes('@');

    if (isEmail) {
      await this.sendOtpEmail(identifier, otp);
    } else {
      // Try WhatsApp first (cheaper), fallback to SMS
      try {
        await this.sendOtpWhatsApp(identifier, otp);
      } catch (error) {
        console.log('WhatsApp delivery failed, falling back to SMS');
        await this.sendOtpSms(identifier, otp);
      }
    }
  }
}

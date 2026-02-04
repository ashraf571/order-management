import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Email sending will be disabled.');
    }
  }

  /**
   * Send OTP email using Resend
   */
  async sendOtpEmail(to: string, otp: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Email service not configured. OTP for ${to}: ${otp}`);
      console.log(`\n📧 ========== OTP EMAIL ==========`);
      console.log(`📧 To: ${to}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log(`⏰ Expires in: 5 minutes`);
      console.log(`================================\n`);
      return;
    }

    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
      const appName = this.configService.get<string>('APP_NAME') || 'Ordering System';

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: this.configService.get<string>('EMAIL_TO') || 'ashrafali.gcs@gmail.com', // its just for a testing
        subject: `Your OTP Code - ${appName}`,
        html: this.getOtpEmailTemplate(otp, appName),
      });

      if (error) {
        this.logger.error(`Failed to send OTP email to ${to}:`, error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      this.logger.log(`OTP email sent successfully to ${to}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending OTP email to ${to}:`, error);
      // Fallback to console log if email fails
      console.log(`\n📧 ========== OTP EMAIL (FALLBACK) ==========`);
      console.log(`📧 To: ${to}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log(`⏰ Expires in: 5 minutes`);
      console.log(`================================\n`);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Email service not configured. Welcome email skipped for ${to}`);
      return;
    }

    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
      const appName = this.configService.get<string>('APP_NAME') || 'Ordering System';

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `Welcome to ${appName}!`,
        html: this.getWelcomeEmailTemplate(name, appName),
      });

      if (error) {
        this.logger.error(`Failed to send welcome email to ${to}:`, error);
        return;
      }

      this.logger.log(`Welcome email sent successfully to ${to}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${to}:`, error);
    }
  }

  /**
   * Get OTP email HTML template
   */
  private getOtpEmailTemplate(otp: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .otp-box {
              background-color: #f3f4f6;
              border: 2px dashed #2563eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #2563eb;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 ${appName}</h1>
              <p>Your One-Time Password</p>
            </div>

            <p>Hello,</p>

            <p>You requested a one-time password (OTP) to log in to your account. Use the code below to complete your login:</p>

            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>

            <p style="text-align: center; color: #6b7280;">
              <strong>This code will expire in 5 minutes.</strong>
            </p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email. Someone may have entered your email address by mistake.
            </div>

            <p>For security reasons, do not share this code with anyone. Our team will never ask for your OTP.</p>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get welcome email HTML template
   */
  private getWelcomeEmailTemplate(name: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .welcome-message {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>

            <div class="welcome-message">🎉</div>

            <h2 style="text-align: center; color: #2563eb;">Welcome, ${name}!</h2>

            <p>Thank you for registering with ${appName}. We're excited to have you on board!</p>

            <p>Your account has been successfully created. You can now:</p>
            <ul>
              <li>Browse our products and services</li>
              <li>Place orders easily</li>
              <li>Track your order status</li>
              <li>Manage your profile</li>
            </ul>

            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

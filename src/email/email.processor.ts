import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface OtpEmailData {
  type: 'otp';
  to: string;
  otp: string;
  appName: string;
}

interface WelcomeEmailData {
  type: 'welcome';
  to: string;
  name: string;
  appName: string;
}

interface OrderConfirmationEmailData {
  type: 'order-confirmation';
  to: string;
  orderData: {
    orderId: number;
    customerName: string;
    totalAmount: number;
    shippingAddress: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
    }>;
  };
  appName: string;
}

type EmailJobData = OtpEmailData | WelcomeEmailData | OrderConfirmationEmailData;

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { data } = job;
    data.to = this.configService.get<string>('EMAIL_TO') || "ashrafali.gcs@gmail.com";

    try {
      switch (data.type) {
        case 'otp':
          await this.sendOtpEmail(data);
          break;
        case 'welcome':
          await this.sendWelcomeEmail(data);
          break;
        case 'order-confirmation':
          await this.sendOrderConfirmationEmail(data);
          break;
        default:
          this.logger.warn(`Unknown email type: ${(data as any).type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process email job: ${error.message}`);
      throw error;
    }
  }

  private async sendOtpEmail(data: OtpEmailData): Promise<void> {
    if (!this.resend) {
      console.log(`\n📧 OTP: ${data.otp} → ${data.to}\n`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: this.configService.get<string>('EMAIL_TO') || data.to,
      subject: `Your OTP Code - ${data.appName}`,
      html: this.getOtpTemplate(data.otp, data.appName),
    });

    if (error) {
      throw new Error(`OTP email failed: ${error.message}`);
    }
  }

  private async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    if (!this.resend) {
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [data.to],
      subject: `Welcome to ${data.appName}!`,
      html: this.getWelcomeTemplate(data.name, data.appName),
    });

    if (error) {
      throw new Error(`Welcome email failed: ${error.message}`);
    }
  }

  private async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
    if (!this.resend) {
      console.log(`\n📧 Order #${data.orderData.orderId} confirmed → ${data.to}\n`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: this.configService.get<string>('EMAIL_TO') || data.to,
      subject: `Order Confirmation - Order #${data.orderData.orderId}`,
      html: this.getOrderConfirmationTemplate(data.orderData, data.appName),
    });

    if (error) {
      throw new Error(`Order confirmation email failed: ${error.message}`);
    }
  }

  private getOtpTemplate(otp: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; text-align: center; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #2563eb; text-align: center;">${appName}</h1>
            <p>Your OTP code:</p>
            <div class="otp-code">${otp}</div>
            <p style="text-align: center; color: #666;">Expires in 5 minutes</p>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeTemplate(name: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #2563eb; text-align: center;">${appName}</h1>
            <h2 style="text-align: center;">Welcome, ${name}! 🎉</h2>
            <p>Thank you for registering. Your account is ready!</p>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(
    orderData: {
      orderId: number;
      customerName: string;
      totalAmount: number;
      shippingAddress: string;
      items: Array<{ productName: string; quantity: number; price: number }>;
    },
    appName: string,
  ): string {
    const itemsHtml = orderData.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.price).toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; }
            .total { font-weight: bold; font-size: 18px; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #2563eb; text-align: center;">${appName}</h1>
            <h2 style="text-align: center;">Order Confirmed ✅</h2>
            <p>Hi ${orderData.customerName},</p>
            <p><strong>Order #${orderData.orderId}</strong></p>
            <table>
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <p class="total">Total: $${Number(orderData.totalAmount).toFixed(2)}</p>
            <p><strong>Shipping:</strong> ${orderData.shippingAddress}</p>
          </div>
        </body>
      </html>
    `;
  }
}

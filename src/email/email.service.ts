import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME') || 'Ordering System';

    await this.emailQueue.add(
      'send-otp',
      {
        type: 'otp',
        to,
        otp,
        appName,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME') || 'Ordering System';

    await this.emailQueue.add(
      'send-welcome',
      {
        type: 'welcome',
        to,
        name,
        appName,
      },
      {
        priority: 3,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );
  }

  async sendOrderConfirmationEmail(
    to: string,
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
    },
  ): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME') || 'Ordering System';

    await this.emailQueue.add(
      'send-order-confirmation',
      {
        type: 'order-confirmation',
        to,
        orderData,
        appName,
      },
      {
        priority: 2,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }
}

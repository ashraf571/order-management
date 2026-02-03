import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['credit_card', 'debit_card', 'paypal', 'cash'], default: 'cash' })
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Column({ length: 255, nullable: true })
  transactionId: string;

  @OneToOne(() => Order, order => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;
}

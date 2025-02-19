import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type EventType = 'DEBIT' | 'CREDIT';

@Entity('user_balances')
export class UserBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  version: number;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: EventType;

  @Column({  type: 'bigint', default: '0' })
  amount: string;

  @Column({ name: 'source_id', default: 0 })
  sourceId: number;

  @Column({ default: 'USD' })
  currency: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
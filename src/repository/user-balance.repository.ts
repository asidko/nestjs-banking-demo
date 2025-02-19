import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from '../entity/user-balance.entity';



type UserBalanceVersionInfo = {
  userId: number,
  lastVersion: number
}

type UserBalanceInfo = UserBalanceVersionInfo & {
  balance: number
}

@Injectable()
export class UserBalanceRepository {
  constructor(
    @InjectRepository(UserBalance)
    private readonly repository: Repository<UserBalance>,
  ) {}

  async getBalanceAndVersion(userId: number, currency: string = 'USD'): Promise<UserBalanceInfo> {
    const result = await this.repository
      .createQueryBuilder('ub')
      .select(
        "SUM(CASE WHEN ub.event_type = 'CREDIT' THEN ub.amount ELSE -ub.amount END)",
        'balance'
      )
      .addSelect("COALESCE(MAX(ub.version), 0)", 'lastVersion')
      .where('ub.user_id = :userId', { userId })
      .andWhere('ub.currency = :currency', { currency })
      .groupBy('ub.user_id')
      .getRawOne();

    return {
      userId,
      balance: Number(result.balance),
      lastVersion: Number(result.lastVersion),
    };
  }

  async createDebitCreditRecords(
    from: UserBalanceVersionInfo,
    to: UserBalanceVersionInfo,
    amountInteger: number,
    currency: string,
  ): Promise<void> {
    // If any insert fails (due to optimistic locking conflict), the transaction is rolled back.
    await this.repository.manager.transaction(async (manager) => {
      const newFromVersion = from.lastVersion + 1;
      await manager.insert(UserBalance, {
        userId: from.userId,
        version: newFromVersion,
        eventType: 'DEBIT',
        amount: ""+amountInteger,
        sourceId: from.userId, // funds originate from the sender.
        currency,
      });
  
      const newToVersion = to.lastVersion + 1;
      await manager.insert(UserBalance, {
        userId: to.userId,
        version: newToVersion,
        eventType: 'CREDIT',
        amount: ""+amountInteger,
        sourceId: from.userId, // funds come from the sender.
        currency,
      });
    });
  }
}
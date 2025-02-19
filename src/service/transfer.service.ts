import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Connection, DataSource } from 'typeorm';
import { UserBalanceRepository } from '../repository/user-balance.repository';
import { UserBalance } from '../entity/user-balance.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class TransferService {
    private readonly log = new Logger(TransferService.name);

    constructor(
        private readonly userBalanceRepository: UserBalanceRepository,
    ) { }

    async transferFunds(senderId: number, receiverId: number, amountInteger: number, currency: string): Promise<void> {
        this.log.debug(`Transferring funds from senderId: ${senderId} to receiverId: ${receiverId} amount: ${amountInteger} currency: ${currency}`);

        // Get sender's balance and version.
        const {
            balance: senderBalance,
            lastVersion: senderVersion
        } = await this.userBalanceRepository.getBalanceAndVersion(senderId, currency);
        this.log.debug(`Current senderId: ${senderId} balance: ${senderBalance}, Balance after sending: ${senderBalance - amountInteger}`);

        if (senderBalance < amountInteger) {
            this.log.warn(`Insufficient funds: senderId: ${senderId}, balance: ${senderBalance}, required: ${amountInteger}`);
            throw new BadRequestException('Insufficient funds');
        }
    
        // Get receiver's current version.
        const { lastVersion: receiverVersion } =
            await this.userBalanceRepository.getBalanceAndVersion(receiverId, currency);

        // Do the transfer
        await this.userBalanceRepository.createDebitCreditRecords(
            {userId: senderId, lastVersion: senderVersion},     // from
            {userId: receiverId, lastVersion: receiverVersion}, // to
            amountInteger,
            currency
        )
    }
}
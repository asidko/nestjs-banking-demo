import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { Connection, DataSource } from 'typeorm';
import { UserBalanceRepository } from '../repository/user-balance.repository';
import { UserBalance } from '../entity/user-balance.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransferRequestDto, TransferResponseDTO } from 'src/dto/transfer.dto';
import { CURRENCY_PROVIDERS, CurrencyProvider } from './currency-provider';

@Injectable()
export class TransferService {
    private readonly log = new Logger(TransferService.name);

    constructor(
        @Inject(CURRENCY_PROVIDERS)
        private readonly currencyProviders: CurrencyProvider[],
        private readonly userBalanceRepository: UserBalanceRepository,
    ) { }

    async transferFunds(transferRequest: TransferRequestDto): Promise<TransferResponseDTO> {
        const { senderId, receiverId, amount, currency } = transferRequest;
        this.log.debug(`Transferring funds from senderId: ${senderId} to receiverId: ${receiverId} amount: ${amount} currency: ${currency}`);

        const currencyProvider = this.currencyProviders.find(it => it.getName() == currency)
        if (!currencyProvider) throw new BadRequestException("Unsupported currency")

        // Get integer amount, like: 10.25 => 1025
        const amountInteger = currencyProvider.convertAmountToInteger(amount);

        // Get sender's balance and version.
        const {
            balance: senderBalance,
            lastVersion: senderVersion
        } = await this.userBalanceRepository.getBalanceAndVersion(senderId, currency);
        this.log.debug(`Current senderId: ${senderId} balance: ${senderBalance}, Balance after sending: ${senderBalance - amountInteger}`);

        if (senderBalance < amountInteger) {
            this.log.error(`Insufficient funds: senderId: ${senderId}, balance: ${senderBalance}, required: ${amountInteger}`);
            throw new BadRequestException('Insufficient funds');
        }

        // Get receiver's current version.
        const { lastVersion: receiverVersion } =
            await this.userBalanceRepository.getBalanceAndVersion(receiverId, currency);

        // Do the transfer
        await this.userBalanceRepository.createDebitCreditRecords(
            { userId: senderId, lastVersion: senderVersion },     // from
            { userId: receiverId, lastVersion: receiverVersion }, // to
            amountInteger,
            currency
        )

        // Get final balances
        const [finalReceiverBalance, finalSenderBalance] = await Promise.all([
            this.userBalanceRepository.getBalanceAndVersion(receiverId, currency),
            this.userBalanceRepository.getBalanceAndVersion(senderId, currency)
        ])
        const senderBalanceStr = currencyProvider.convertAmountToNormal(finalSenderBalance.balance);
        const receiverBalanceStr = currencyProvider.convertAmountToNormal(finalReceiverBalance.balance);

        return {
            senderId,
            receiverId,
            currency,
            senderBalance: senderBalanceStr,
            receiverBalance: receiverBalanceStr
        }
    }
}
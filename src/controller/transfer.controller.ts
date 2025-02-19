import { Controller, Post, Body, UsePipes, Inject, Logger, BadRequestException } from '@nestjs/common';
import { TransferDto } from 'src/dto/transfer.dto';
import { TransferService } from 'src/service/transfer.service';
import { CURRENCY_PROVIDERS, CurrencyProvider } from 'src/service/currency-provider';
import { CorrectedAmount, ValidateCurrencyPipe } from './currency.pipe';

@Controller('/api/internal/v1/transfers')
export class TransferController {
  private readonly log = new Logger(TransferController.name);

  constructor(
    private readonly transferService: TransferService,
    @Inject(CURRENCY_PROVIDERS) private readonly currencyProviders: CurrencyProvider[]
  ) {}

  @Post()
  @UsePipes(ValidateCurrencyPipe)
  async transfer(@Body() transferDto: TransferDto & CorrectedAmount) {
    const payloadJson = JSON.stringify(transferDto);
    this.log.debug(`Started handling REST <CREATE_TRANSFER> request with params: ${payloadJson}`)

    this.transferService.transferFunds(transferDto.senderId, transferDto.receiverId, transferDto.amountInteger, transferDto.currency);

    this.log.debug(`Completed handling REST <CREATE_TRANSFER> request with params: ${payloadJson}`)
  }
}
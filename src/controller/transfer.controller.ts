import { Controller, Post, Body, UsePipes, Inject, Logger, BadRequestException } from '@nestjs/common';
import { TransferRequestDto, TransferResponseDTO } from 'src/dto/transfer.dto';
import { TransferService } from 'src/service/transfer.service';
import { ValidateCurrencyPipe } from './currency.pipe';

@Controller('/api/internal/v1/transfers')
export class TransferController {
  private readonly log = new Logger(TransferController.name);

  constructor(
    private readonly transferService: TransferService,
  ) {}

  @Post()
  @UsePipes(ValidateCurrencyPipe)
  async transfer(@Body() transferDto: TransferRequestDto): Promise<TransferResponseDTO> {
    this.log.debug(`Started handling REST <CREATE_TRANSFER> request with params: ${JSON.stringify(transferDto)}`)

    const response = await this.transferService.transferFunds(transferDto);
    this.log.debug(`Completed handling REST <CREATE_TRANSFER> request with params: ${JSON.stringify(response)}`)

    return response;
  }
}
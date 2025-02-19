import { BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";
import { TransferRequestDto } from "src/dto/transfer.dto";
import { CURRENCY_PROVIDERS, CurrencyProvider } from "src/service/currency-provider";

@Injectable()
export class ValidateCurrencyPipe implements PipeTransform<TransferRequestDto, TransferRequestDto> {
    constructor(
        @Inject(CURRENCY_PROVIDERS)
        private readonly currencyProviders: CurrencyProvider[],
    ) { }

    transform(value: TransferRequestDto) {
        const {currency, amount} = value;
        
        const provider = this.currencyProviders.find(it=> it.getName()==currency);
        if (!provider) 
            throw new BadRequestException("Currency not supported.")

        if (!amount || amount == "0")
            throw new BadRequestException("Zero amount is not allowed")

        if (Number(amount) < 0)
            throw new BadRequestException("Transfer negative amount it not possible")

        if (!provider.validateInputAmount(amount)) 
            throw new BadRequestException("Amount format is not valid for given currency")

        return value;
    }
}
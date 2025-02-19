import { BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";
import { TransferDto } from "src/dto/transfer.dto";
import { CURRENCY_PROVIDERS, CurrencyProvider } from "src/service/currency-provider";

export type CorrectedAmount = {
    amountInteger: number
}

@Injectable()
export class ValidateCurrencyPipe implements PipeTransform<TransferDto, TransferDto & CorrectedAmount> {
    constructor(
        @Inject(CURRENCY_PROVIDERS)
        private readonly currencyProviders: CurrencyProvider[],
    ) { }

    transform(value: TransferDto) {
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

        const amountInteger = provider.convertAmountToInteger(value.amount);

        return {...value, amountInteger};
    }
}
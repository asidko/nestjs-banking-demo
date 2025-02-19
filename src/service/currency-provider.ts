import { Injectable } from "@nestjs/common";

export const CURRENCY_PROVIDERS = "CURRENCY_PROVIDERS";

export interface CurrencyProvider {
    getName(): string,
    validateInputAmount(amount: string): boolean
    convertAmountToInteger(amount: string): number
}

@Injectable()
export class USDCurrencyProvider implements CurrencyProvider {
    private readonly DOLLAR_WITH_CENTS_REGEX = /^\d+(\.\d{1,2})?$/;

    getName = () => "USD";

    validateInputAmount = (amount: string) => this.DOLLAR_WITH_CENTS_REGEX.test(amount);

    convertAmountToInteger = (amount: string): number => {
        if (!this.validateInputAmount(amount)) throw new Error("Invalid amount format");
        return Math.round(parseFloat(amount) * 100); // convert to cents (integer)
    };
}
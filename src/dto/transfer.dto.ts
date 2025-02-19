import { IsAlphanumeric, IsNotEmpty, IsNumberString, IsPositive } from "class-validator";

export class TransferDto {
    @IsPositive()
    senderId: number;

    @IsPositive()
    receiverId: number;

    @IsNumberString()
    amount: string;

    @IsAlphanumeric()
    @IsNotEmpty()
    currency: string;
  }
  
import { IsAlphanumeric, IsNotEmpty, IsNumberString, IsPositive } from "class-validator";

export class TransferRequestDto {
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
  
  export class TransferResponseDTO {
    senderId: number;
    receiverId: number;
    currency: string;
    senderBalance: string
    receiverBalance: string
  }
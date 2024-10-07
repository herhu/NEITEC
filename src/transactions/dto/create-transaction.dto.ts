import { IsNumber, IsPositive, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorators
import { TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: 100.5, description: 'The transaction amount (must be positive)' }) // Swagger decorator
  @IsNumber()
  @IsPositive()
  amount: number; // The transaction amount must be a positive number
}

export class UpdateTransactionStatusDto {
  @ApiProperty({ example: 'APPROVED', description: 'The new status of the transaction' })
  @IsEnum(TransactionStatus, { message: 'Status must be APPROVED or REJECTED' })
  status: TransactionStatus; // This ensures that the status is either APPROVED or REJECTED
}
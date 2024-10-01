// src/transactions/dto/create-transaction.dto.ts

import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorators

export class CreateTransactionDto {
  @ApiProperty({ example: 100.5, description: 'The transaction amount (must be positive)' }) // Swagger decorator
  @IsNumber()
  @IsPositive()
  amount: number; // The transaction amount must be a positive number
}

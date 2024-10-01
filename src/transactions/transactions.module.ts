// src/transactions/transactions.module.ts

import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule to interact with the database

@Module({
  imports: [PrismaModule], // Import PrismaModule to access PrismaService
  providers: [TransactionsService], // TransactionsService contains transaction logic
  controllers: [TransactionsController], // TransactionsController handles transaction routes
})
export class TransactionsModule {}

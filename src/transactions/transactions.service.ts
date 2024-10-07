import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService for database access
import { TransactionStatus } from '@prisma/client'; // TransactionStatus enum from Prisma schema
import { CreateTransactionDto } from './dto/create-transaction.dto'; // DTO for transaction creation

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // Create a new transaction
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { amount } = createTransactionDto;
    return this.prisma.transaction.create({
      data: {
        userId,
        amount,
        status: TransactionStatus.PENDING, // Default status is pending
      },
    });
  }

  // Get all transactions for the logged-in user
  async findAllForUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
    });
  }

  // Admin: Approve or reject a transaction
  async updateTransactionStatus(transactionId: string, status: TransactionStatus) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    // Optional: Only allow update if status is PENDING
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is already approved or rejected');
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }

  // Admin: Get all pending transactions
  async findAllPending() {
    return this.prisma.transaction.findMany({
      where: { status: TransactionStatus.PENDING },
    });
  }
}

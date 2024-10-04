import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

// Mock PrismaService with Jest
const mockPrismaService = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Use mockPrismaService for PrismaService
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto = { amount: 100 };
      const mockTransaction = {
        id: 'transaction-id',
        userId: 'user-id',
        amount: 100,
        status: TransactionStatus.PENDING,
      };

      // Mock Prisma's create method
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await transactionsService.create('user-id', createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          amount: 100,
          status: TransactionStatus.PENDING,
        },
      });
    });
  });

  describe('findAllForUser', () => {
    it('should return all transactions for a specific user', async () => {
      const mockTransactions = [
        {
          id: 'transaction-id-1',
          userId: 'user-id',
          amount: 50,
          status: TransactionStatus.PENDING,
        },
      ];

      // Mock Prisma's findMany method
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await transactionsService.findAllForUser('user-id');

      expect(result).toEqual(mockTransactions);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update the transaction status if transaction is found', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        userId: 'user-id',
        amount: 100,
        status: TransactionStatus.PENDING,
      };
      const updatedTransaction = { ...mockTransaction, status: TransactionStatus.APPROVED };

      // Mock Prisma's findUnique and update methods
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTransaction);

      const result = await transactionsService.updateTransactionStatus(
        'transaction-id',
        TransactionStatus.APPROVED,
      );

      expect(result).toEqual(updatedTransaction);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'transaction-id' },
      });
      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-id' },
        data: { status: TransactionStatus.APPROVED },
      });
    });

    it('should throw a NotFoundException if transaction is not found', async () => {
      // Mock Prisma's findUnique method to return null
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(
        transactionsService.updateTransactionStatus('non-existent-id', TransactionStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('findAllPending', () => {
    it('should return all pending transactions', async () => {
      const mockPendingTransactions = [
        {
          id: 'transaction-id-1',
          userId: 'user-id',
          amount: 100,
          status: TransactionStatus.PENDING,
        },
      ];

      // Mock Prisma's findMany method
      mockPrismaService.transaction.findMany.mockResolvedValue(mockPendingTransactions);

      const result = await transactionsService.findAllPending();

      expect(result).toEqual(mockPendingTransactions);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { status: TransactionStatus.PENDING },
      });
    });
  });
});

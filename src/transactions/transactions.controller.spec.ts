// src/transactions/transactions.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, User } from '@prisma/client';

// Mock the TransactionsService
const mockTransactionsService = {
  create: jest.fn(),
  findAllForUser: jest.fn(),
  findAllPending: jest.fn(),
  updateTransactionStatus: jest.fn(),
};

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    transactionsController = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  describe('createTransaction', () => {
    it('should create a transaction and return the result', async () => {
      const user: User = { id: 'user-id', email: 'user@example.com', password: 'password', role: 'USER', createdAt: new Date() };
      const createTransactionDto: CreateTransactionDto = { amount: 100.5 };
      const mockTransaction = { id: 'transaction-id', userId: 'user-id', amount: 100.5, status: TransactionStatus.PENDING };

      // Mock the service create method
      mockTransactionsService.create.mockResolvedValue(mockTransaction);

      const result = await transactionsController.createTransaction(user, createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(user.id, createTransactionDto);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions for the logged-in user', async () => {
      const user: User = { id: 'user-id', email: 'user@example.com', password: 'password', role: 'USER', createdAt: new Date() };
      const mockTransactions = [{ id: 'transaction-id-1', userId: 'user-id', amount: 50, status: TransactionStatus.PENDING }];

      // Mock the service findAllForUser method
      mockTransactionsService.findAllForUser.mockResolvedValue(mockTransactions);

      const result = await transactionsController.getAllTransactions(user);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionsService.findAllForUser).toHaveBeenCalledWith(user.id);
    });
  });

  describe('getAllPendingTransactions', () => {
    it('should return all pending transactions for admin', async () => {
      const mockPendingTransactions = [
        { id: 'transaction-id-1', userId: 'user-id', amount: 100, status: TransactionStatus.PENDING },
      ];

      // Mock the service findAllPending method
      mockTransactionsService.findAllPending.mockResolvedValue(mockPendingTransactions);

      const result = await transactionsController.getAllPendingTransactions();

      expect(result).toEqual(mockPendingTransactions);
      expect(mockTransactionsService.findAllPending).toHaveBeenCalled();
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update the transaction status and return the updated transaction', async () => {
      const mockUpdatedTransaction = {
        id: 'transaction-id-1',
        userId: 'user-id',
        amount: 100,
        status: TransactionStatus.APPROVED,
      };

      // Mock the service updateTransactionStatus method
      mockTransactionsService.updateTransactionStatus.mockResolvedValue(mockUpdatedTransaction);

      const result = await transactionsController.updateTransactionStatus('transaction-id-1', {
        status: TransactionStatus.APPROVED,
      });

      expect(result).toEqual(mockUpdatedTransaction);
      expect(mockTransactionsService.updateTransactionStatus).toHaveBeenCalledWith(
        'transaction-id-1',
        TransactionStatus.APPROVED,
      );
    });
  });
});


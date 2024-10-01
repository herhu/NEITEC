// src/prisma/prisma.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService to provide the database URL
const mockConfigService = {
  get: jest.fn().mockReturnValue('postgresql://test-user:test-password@localhost:5432/test-db'),
};

// Mock PrismaClient methods
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    // Manually mock the methods of PrismaClient
    prismaService.$connect = mockPrismaClient.$connect;
    prismaService.$disconnect = mockPrismaClient.$disconnect;
  });

  describe('onModuleInit', () => {
    it('should call $connect to establish the database connection', async () => {
      await prismaService.onModuleInit();
      expect(mockPrismaClient.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect to close the database connection', async () => {
      await prismaService.onModuleDestroy();
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should configure the Prisma client with the correct database URL', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('database.url');
      expect(prismaService).toBeDefined(); // Ensure the PrismaService instance is created
    });
  });
});

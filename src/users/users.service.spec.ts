// src/users/users.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Mock bcrypt functions
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Use mock PrismaService
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      const createUserDto = { email: 'user@example.com', password: 'password123', role: Role.USER };
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
      };

      // Mock bcrypt to return a hashed password
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      // Mock Prisma's user.create method
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await usersService.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: 'hashedPassword',
          role: Role.USER,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw a ConflictException if email already exists', async () => {
      const createUserDto = { email: 'existing@example.com', password: 'password123', role: Role.USER };

      // Mock Prisma to throw a unique constraint violation error
      mockPrismaService.user.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(usersService.createUser(createUserDto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: expect.any(String),
          role: Role.USER,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
      };

      // Mock Prisma's findUnique method
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('user@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
      };

      // Mock Prisma's findUnique method
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      // Mock bcrypt to validate the password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await usersService.validateUser('user@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return null if user is not found or password is incorrect', async () => {
      // Case 1: User not found
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result1 = await usersService.validateUser('nonexistent@example.com', 'password123');
      expect(result1).toBeNull();

      // Case 2: User found but password is incorrect
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result2 = await usersService.validateUser('user@example.com', 'wrongPassword');
      expect(result2).toBeNull();
    });
  });
});

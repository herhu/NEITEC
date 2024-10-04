import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

// Mock UsersService
const mockUsersService = {
  createUser: jest.fn(),
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService, // Use mock UsersService
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      };
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'USER',
        createdAt: new Date(),
      };

      // Mock the service method to return the created user
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await usersController.register(createUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw a ConflictException if the email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: 'USER',
      };

      // Mock the service to throw ConflictException when trying to create a user with an existing email
      mockUsersService.createUser.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(usersController.register(createUserDto)).rejects.toThrow(ConflictException);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});

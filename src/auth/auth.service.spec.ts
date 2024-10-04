import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

// Mocked UsersService with a basic implementation
const mockUsersService = {
  validateUser: jest.fn(),
};

// Mocked JwtService with a basic implementation
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return a user object when valid credentials are provided', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com', password: 'hashedPassword' };
      mockUsersService.validateUser.mockResolvedValue(mockUser); // Mock valid user

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toEqual({ id: 'user-id', email: 'test@example.com' }); // Password is stripped out
      expect(mockUsersService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should throw UnauthorizedException when invalid credentials are provided', async () => {
      mockUsersService.validateUser.mockResolvedValue(null); // Mock invalid credentials

      await expect(
        authService.validateUser('invalid@example.com', 'wrongPassword'),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        'invalid@example.com',
        'wrongPassword',
      );
    });
  });

  describe('login', () => {
    it('should generate and return a JWT token', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const result = await authService.login(mockUser);

      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user-id',
      });
    });
  });
});

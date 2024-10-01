// src/auth/auth.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Mocked JWT service to simulate token generation
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

// Mocked AuthService with login functionality
const mockAuthService = {
  login: jest.fn((user) => {
    return {
      access_token: 'mocked-jwt-token',
    };
  }),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // Test login functionality
  describe('login', () => {
    it('should return a JWT token when valid credentials are provided', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const req = { user: { email: loginDto.email, id: 'user-id' } }; // Mocked request object

      // Act
      const result = await authController.login(loginDto, req);

      // Assert
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
    });
  });
});

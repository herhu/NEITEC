// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // Inject UsersService to validate users
    private jwtService: JwtService, // JWTService to generate tokens
  ) {}

  // Validate user credentials
  async validateUser(email: string, userPassword: string): Promise<any> {
    const user = await this.usersService.validateUser(email, userPassword);
    if (!user) {
      // If user is not found or password is incorrect, throw UnauthorizedException
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password, ...result } = user;
    return result; // Return user object without the password
  }

  // Generate JWT token for authenticated users
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

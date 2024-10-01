// src/users/users.service.ts

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService for database access
import { User, Role } from '@prisma/client'; // Include Role from Prisma schema
import { CreateUserDto } from './dto/create-user.dto'; // Import CreateUserDto
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Register a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role } = createUserDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use the role from the request or default to 'USER'
    const userRole = role ?? Role.USER;

    try {
      // Create the user in the database
      return await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: userRole, // Dynamically assign the role
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // P2002 is the unique constraint violation error code in Prisma
        throw new ConflictException('Email already exists');
      }
      throw error; // Re-throw other unexpected errors
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}

// src/users/users.service.ts

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService for database access
import { User, Role } from '@prisma/client'; // Include Role from Prisma schema
import { CreateUserDto } from './dto/create-user.dto'; // Import CreateUserDto
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Adjust return type to exclude the password field
  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, role } = createUserDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use the role from the request or default to 'USER'
    const userRole = role ?? Role.USER;

    try {
      // Create the user in the database
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: userRole,
        },
      });

      // Exclude the password from the returned object
      const { password: _, ...result } = user;
      return result; // Return the user object without the password
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
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

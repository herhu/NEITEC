// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule to interact with the database

@Module({
  imports: [PrismaModule], // Import PrismaModule to access PrismaService
  providers: [UsersService], // UsersService provides user-related logic
  controllers: [UsersController], // UsersController handles user-related routes
  exports: [UsersService], // Export UsersService to be used in AuthModule
})
export class UsersModule {}

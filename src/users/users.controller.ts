// src/users/users.controller.ts

import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger'; // Import Swagger decorators
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto'; // Import CreateUserDto

@ApiTags('Users') // Group under "Users" in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Register a new user or admin' }) // Describe the operation
  @ApiBody({ type: CreateUserDto }) // Describe the request body using CreateUserDto
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' }) // Conflict for duplicate emails
  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto); // Pass the DTO directly to the service
  }
}

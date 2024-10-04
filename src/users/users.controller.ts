import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger'; 
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto'; 

@ApiTags('Users') // Group under "Users" in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Register a new user or admin' })
  @ApiBody({ type: CreateUserDto }) 
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' }) // Conflict for duplicate emails
  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto); // Pass the DTO directly to the service
  }
}

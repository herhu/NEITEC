// src/users/dto/create-user.dto.ts

import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Import Swagger decorators
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ enum: Role, description: 'The role of the user (USER or ADMIN)' })
  @IsOptional()
  @IsEnum(Role) // Validate that the role is either 'USER' or 'ADMIN'
  role?: Role;
}

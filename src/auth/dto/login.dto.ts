// src/auth/dto/login.dto.ts

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorator

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of the user' }) // Describes the field in Swagger
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' }) // Describes the field in Swagger
  @IsString()
  password: string;
}

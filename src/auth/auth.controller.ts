import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'; 
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto'; 

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' }) // Describes the operation
  @ApiBody({ type: LoginDto }) // Describes the body payload using the LoginDto
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard) // Guard applied to validate user credentials using LocalStrategy
  @HttpCode(HttpStatus.OK) // Explicitly set HTTP status to 200 OK
  @Post('login')
  async login(@Body(ValidationPipe) _loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user); // Return JWT token if valid
  }
}

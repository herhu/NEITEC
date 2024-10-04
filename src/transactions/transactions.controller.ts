import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger'; // Import Swagger decorators
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Protect endpoints with JWT authentication
import { CurrentUser } from '../common/decorators/current-user.decorator'; // Custom decorator to get the current user
import { RoleGuard } from '../auth/role.guard'; // Role guard to restrict access for certain roles
import { Roles } from '../auth/roles.decorator'; // Role decorator to specify roles
import { TransactionStatus, User } from '@prisma/client'; 

@ApiTags('Transactions')
@ApiBearerAuth() // Enable JWT authentication in Swagger
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto }) // Describe request body for Swagger
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @UseGuards(JwtAuthGuard) // User must be authenticated
  @Post('create')
  async createTransaction(
    @CurrentUser() user: User, // Extract the authenticated user from the request
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto, // Use validation pipe
  ) {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @ApiOperation({ summary: 'Get all transactions for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTransactions(@CurrentUser() user: User) {
    return this.transactionsService.findAllForUser(user.id);
  }

  @ApiOperation({ summary: 'Get all pending transactions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pending transactions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN') // Restrict to admin role
  @Get('pending')
  async getAllPendingTransactions() {
    return this.transactionsService.findAllPending();
  }

  @ApiOperation({ summary: 'Approve or reject a transaction (Admin only)' })
  @ApiResponse({ status: 200, description: 'Transaction status updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN') // Restrict to admin role
  @Patch(':id/status')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() body: { status: TransactionStatus },
  ) {
    return this.transactionsService.updateTransactionStatus(id, body.status);
  }
}

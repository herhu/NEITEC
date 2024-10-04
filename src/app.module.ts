import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Global access to config values
      load: [configuration], // Load custom configuration
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
  ],
})
export class AppModule {}

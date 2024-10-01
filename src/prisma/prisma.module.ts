// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // PrismaService to interact with the database
  exports: [PrismaService], // Export PrismaService so other modules can use it
})
export class PrismaModule {}

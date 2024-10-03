import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

// Mock PrismaClient methods ($connect and $disconnect)
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(Object.assign(new PrismaService(), mockPrismaClient)) // Properly mock the PrismaClient
      .compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect when module is initialized', async () => {
      // Call onModuleInit lifecycle method
      await prismaService.onModuleInit();

      // Expect $connect to have been called
      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect when module is destroyed', async () => {
      // Call onModuleDestroy lifecycle method
      await prismaService.onModuleDestroy();

      // Expect $disconnect to have been called
      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // For dynamic user creation

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Use global validation pipe for DTO validation
    app.useGlobalPipes(new ValidationPipe());

    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    // Clean up and disconnect Prisma after tests
    await prismaService.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // Clear the database before each test
    await prismaService.transaction.deleteMany({});
    await prismaService.user.deleteMany({});
  });

  const createTestUser = async (role: 'USER' | 'ADMIN') => {
    const email = `${uuidv4()}@example.com`; // Generate a unique email for each test
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    const token = jwtService.sign({ email: user.email, sub: user.id });
    return { user, token };
  };

  it('/transactions/create (POST) - should create a new transaction', async () => {
    // Dynamically create a test user
    const { token: userToken } = await createTestUser('USER');

    const response = await request(app.getHttpServer())
      .post('/transactions/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 100.5,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(100.5);
    expect(response.body.status).toBe('PENDING');
  });

  it('/transactions (GET) - should get all transactions for the user', async () => {
    // Dynamically create a test user
    const { user, token: userToken } = await createTestUser('USER');

    // Create a transaction for the test user
    await prismaService.transaction.create({
      data: {
        userId: user.id,
        amount: 100.5,
        status: 'PENDING',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].amount).toBe(100.5);
    expect(response.body[0].status).toBe('PENDING');
  });

  it('/transactions/pending (GET) - should get all pending transactions (Admin only)', async () => {
    // Dynamically create a test user and admin
    const { user } = await createTestUser('USER');
    const { token: adminToken } = await createTestUser('ADMIN');

    // Create a pending transaction for the test user
    await prismaService.transaction.create({
      data: {
        userId: user.id,
        amount: 100.5,
        status: 'PENDING',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/transactions/pending')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].amount).toBe(100.5);
    expect(response.body[0].status).toBe('PENDING');
  });

  it('/transactions/:id/status (PATCH) - should approve a transaction (Admin only)', async () => {
    // Dynamically create a test user and admin
    const { user } = await createTestUser('USER');
    const { token: adminToken } = await createTestUser('ADMIN');

    // Create a transaction for the test user
    const transaction = await prismaService.transaction.create({
      data: {
        userId: user.id,
        amount: 100.5,
        status: 'PENDING',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/transactions/${transaction.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    expect(response.body.status).toBe('APPROVED');
  });
});

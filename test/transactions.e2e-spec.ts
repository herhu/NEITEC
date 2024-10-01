import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

describe('Transactions E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE transactions CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
  });

  afterAll(async () => {
    await app.close();
  });

  const registerUser = async (email: string, password: string, role: 'USER' | 'ADMIN') => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({ email, password, role });
  };

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    return response.body.access_token;
  };

  beforeEach(async () => {
    // Register and log in a regular user
    await registerUser('user@example.com', 'password123', 'USER');
    userToken = await loginUser('user@example.com', 'password123');

    // Register and log in an admin user
    await registerUser('admin@example.com', 'adminpassword', 'ADMIN');
    adminToken = await loginUser('admin@example.com', 'adminpassword');
  });

  describe('POST /transactions/create', () => {
    it('should allow a user to create a transaction', async () => {
      const transactionData = { amount: 100.5 };

      return request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201)
        .expect((res) => {
          expect(res.body.amount).toBe(transactionData.amount);
          expect(res.body.status).toBe(TransactionStatus.PENDING);
        });
    });

    it('should forbid creating a transaction without JWT token', async () => {
      const transactionData = { amount: 100.5 };

      return request(app.getHttpServer())
        .post('/transactions/create')
        .send(transactionData)
        .expect(401);
    });
  });

  describe('GET /transactions', () => {
    it('should allow a user to retrieve their transactions', async () => {
      const transactionData = { amount: 100.5 };

      // Create a transaction first
      await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      // Retrieve transactions for the user
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(1); // Ensure there is one transaction
          expect(res.body[0].amount).toBe(transactionData.amount);
        });
    });
  });

  describe('GET /transactions/pending (Admin only)', () => {
    it('should allow an admin to view all pending transactions', async () => {
      const transactionData = { amount: 100.5 };

      // User creates a transaction
      await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      // Admin retrieves pending transactions
      return request(app.getHttpServer())
        .get('/transactions/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(1); // Ensure there is one pending transaction
          expect(res.body[0].status).toBe(TransactionStatus.PENDING);
        });
    });

    it('should forbid a user from viewing pending transactions', async () => {
      return request(app.getHttpServer())
        .get('/transactions/pending')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403); // Forbidden
    });
  });

  describe('PATCH /transactions/:id/status (Admin only)', () => {
    it('should allow an admin to approve a transaction', async () => {
      const transactionData = { amount: 100.5 };

      // User creates a transaction
      const createResponse = await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      const transactionId = createResponse.body.id;

      // Admin approves the transaction
      return request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: TransactionStatus.APPROVED })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(TransactionStatus.APPROVED);
        });
    });

    it('should return 404 if the transaction does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/transactions/non-existent-id/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: TransactionStatus.APPROVED })
        .expect(404);
    });

    it('should forbid a user from approving a transaction', async () => {
      const transactionData = { amount: 100.5 };

      // User creates a transaction
      const createResponse = await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      const transactionId = createResponse.body.id;

      // User attempts to approve the transaction (not allowed)
      return request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: TransactionStatus.APPROVED })
        .expect(403); // Forbidden
    });
  });
});

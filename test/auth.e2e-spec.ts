import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest'; // Supertest for making HTTP requests
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService); // Get PrismaService for database manipulation

    await app.init();
  });

  afterEach(async () => {
    // Clean the users table after each test to maintain test isolation
    await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
  });

  afterAll(async () => {
    await app.close(); // Close the app after tests
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(user)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe(user.email); // Check if the correct email is returned
        });
    });

    it('should throw a conflict error if email already exists', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      };

      // First registration
      await request(app.getHttpServer()).post('/users/register').send(user).expect(201);

      // Attempting to register with the same email again
      return request(app.getHttpServer())
        .post('/users/register')
        .send(user)
        .expect(409); // Expect conflict error
    });
  });

  describe('POST /auth/login', () => {
    it('should log in the user and return a JWT token', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
      };

      // Register the user first
      await request(app.getHttpServer()).post('/users/register').send(user).expect(201);

      // Log in the user
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(user)
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined(); // Check if JWT token is returned
        });
    });

    it('should return 401 for invalid credentials', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
      };

      // Register the user first
      await request(app.getHttpServer()).post('/users/register').send(user).expect(201);

      // Attempt to login with incorrect password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongPassword',
        })
        .expect(401); // Expect unauthorized
    });
  });
});

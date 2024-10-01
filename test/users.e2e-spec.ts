import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest'; // Supertest for making HTTP requests
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService); // Get PrismaService for DB access

    await app.init();
  });

  afterEach(async () => {
    // Clean up the users table after each test
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
          expect(res.body.email).toBe(user.email); // Ensure correct email is returned
          expect(res.body.role).toBe('USER'); // Ensure the role is correct
        });
    });

    it('should register a new admin', async () => {
      const admin = {
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'ADMIN',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(admin)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe(admin.email); // Ensure correct email is returned
          expect(res.body.role).toBe('ADMIN'); // Ensure the role is correct
        });
    });

    it('should return a conflict error when registering with an existing email', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      };

      // First registration should succeed
      await request(app.getHttpServer()).post('/users/register').send(user).expect(201);

      // Second registration with the same email should fail
      return request(app.getHttpServer())
        .post('/users/register')
        .send(user)
        .expect(409); // Expect a conflict
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a registered user and return a JWT token', async () => {
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
          expect(res.body.access_token).toBeDefined(); // Ensure JWT token is returned
        });
    });

    it('should log in a registered admin and return a JWT token', async () => {
      const admin = {
        email: 'admin@example.com',
        password: 'adminpassword',
      };

      // Register the admin first
      await request(app.getHttpServer()).post('/users/register').send(admin).expect(201);

      // Log in the admin
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(admin)
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined(); // Ensure JWT token is returned
        });
    });

    it('should return 401 for invalid login credentials', async () => {
      const user = {
        email: 'user@example.com',
        password: 'password123',
      };

      // Register the user first
      await request(app.getHttpServer()).post('/users/register').send(user).expect(201);

      // Attempt to login with an incorrect password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        })
        .expect(401); // Expect unauthorized
    });
  });
});

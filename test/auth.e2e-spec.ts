// test/auth.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // To dynamically generate unique user data

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Use global validation pipe
    app.useGlobalPipes(new ValidationPipe());

    prismaService = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // Disconnect Prisma and close the app after tests
    await prismaService.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // Clean the user table before each test
    await prismaService.user.deleteMany({});
  });

  const createUniqueTestUser = async () => {
    const email = `${uuidv4()}@example.com`; // Generate a unique email for each test
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a user with a unique email
    await prismaService.user.create({
      data: {
        email,
        password: hashedPassword, // Store the hashed password
        role: 'USER',
      },
    });

    return { email, password };
  };

  it('/auth/login (POST) - should log in with valid credentials', async () => {
    // Create a unique test user
    const { email, password } = await createUniqueTestUser();

    // Attempt to log in with the correct password
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password, // Provide the plain password for login
      })
      .expect(200); // Expect 200 OK

    // Ensure the JWT token is returned
    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - should fail with invalid credentials', async () => {
    // Create a unique test user
    const { email } = await createUniqueTestUser();

    // Attempt to log in with an invalid password
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'wrongpassword', // Provide an incorrect password
      })
      .expect(401); // Expect 401 Unauthorized
  });

  it('/auth/login (POST) - should fail if the user does not exist', async () => {
    // Attempt to log in with a non-existent user
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(401); // Expect 401 Unauthorized
  });
});

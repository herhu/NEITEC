import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid'; // To dynamically generate unique user data

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation
    app.useGlobalPipes(new ValidationPipe());

    prismaService = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // Disconnect Prisma and close the app after all tests
    await prismaService.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // Clear the database before each test to ensure isolation
    await prismaService.user.deleteMany({});
  });

  const createUniqueTestUser = () => ({
    email: `${uuidv4()}@example.com`,
    password: 'password123',
  });

  it('/users/register (POST) - should register a new user', async () => {
    const testUser = createUniqueTestUser();

    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201); // Expect 201 Created

    expect(response.body.email).toBe(testUser.email);
    expect(response.body.password).toBeUndefined(); // Password should not be exposed in the response
  });

  it('/users/register (POST) - should fail if email is missing', async () => {
    const testUser = createUniqueTestUser();

    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        password: testUser.password,
      })
      .expect(400); // Expect 400 Bad Request due to missing email
  });

  it('/users/register (POST) - should fail if email is invalid', async () => {
    const testUser = createUniqueTestUser();

    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'invalid-email',
        password: testUser.password,
      })
      .expect(400); // Expect 400 Bad Request due to invalid email format
  });

  it('/users/register (POST) - should fail if email already exists', async () => {
    const testUser = createUniqueTestUser();

    // Register the first user
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201); // Expect 201 Created for the first registration

    // Attempt to register the same email again
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(409); // Expect 409 Conflict because the email already exists

    expect(response.body.message).toBe('Email already exists');
  });
});

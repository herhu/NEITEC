### Project: Transaction Validation System

---

#### Overview

The **Transaction Validation System** is a backend API built with **NestJS**, **TypeScript**, **Prisma**, **JWT** authentication, **PostgreSQL**, and several other modern backend tools. It allows users to create transaction requests, which must be approved or rejected by an admin. The system is designed with a focus on security, scalability, and clean architecture. The project also includes a robust CI/CD pipeline for automated testing, linting, and deployment.

---

### Project Structure

```
├── src
│   ├── auth                    # Authentication module
│   │   ├── auth.controller.ts   # Handles login requests
│   │   ├── auth.service.ts      # Implements login logic
│   │   ├── jwt.strategy.ts      # JWT strategy for validating tokens
│   │   └── local.strategy.ts    # Local strategy for validating credentials
│   ├── common                   # Common utilities and decorators
│   │   └── decorators
│   │       └── current-user.decorator.ts
│   ├── prisma                   # Prisma configuration and database access
│   │   └── prisma.service.ts
│   ├── transactions             # Transactions module
│   │   ├── dto
│   │   │   └── create-transaction.dto.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   └── users                    # Users module
│       ├── dto
│       │   └── create-user.dto.ts
│       ├── users.controller.ts
│       └── users.service.ts
├── test                         # Contains unit and e2e tests
│   ├── auth.e2e-spec.ts
│   ├── transactions.e2e-spec.ts
│   └── users.e2e-spec.ts
├── prisma                       # Prisma schema
│   └── schema.prisma
├── Dockerfile                   # Docker configuration file
├── .env                         # Environment variables
├── .env.test                    # Test environment variables
├── .eslintrc.js                 # ESLint configuration
├── jest.config.js               # Jest configuration
└── README.md                    # Project documentation
```

---

### Features

- **User Roles**: Users can either have the role of `USER` or `ADMIN`. Only admins can approve or reject transactions.
- **Transaction Lifecycle**: Users can create transactions, and admins can view pending transactions to approve or reject them.
- **Authentication**: JWT-based authentication using `@nestjs/passport` for secure API endpoints.
- **Database**: **Prisma ORM** with **PostgreSQL** for managing users and transactions.
- **CI/CD Pipeline**: Automated testing, linting, and production build through GitHub Actions.
- **Dockerized Environment**: The application is containerized with **Docker**, making it easy to run in any environment.

---

### Instructions

#### Prerequisites

- **Node.js** (v18 or later)
- **PostgreSQL** (v13 or later)
- **Docker** (for containerization)
- **npm**

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repository/transaction-validation-system.git
   ```

2. Navigate into the project directory:

   ```bash
   cd transaction-validation-system
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up your environment variables:

   - Create a `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

   - Edit `.env` to configure your **PostgreSQL** database connection.

5. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

6. Apply Prisma migrations:

   ```bash
   npx prisma migrate deploy
   ```

---

### Running the Application

#### Development Mode

1. Start the application in development mode:

   ```bash
   npm run start:dev
   ```

2. The server will start at `http://localhost:3000`.

#### Production Mode (Docker)

1. Build the Docker image:

   ```bash
   docker build -t transaction-validation-system .
   ```

2. Run the Docker container:

   ```bash
   docker run -d -p 3000:3000 --name transaction-app-container transaction-validation-system
   ```

3. The application will be available at `http://localhost:3000`.

#### Testing

- **Unit Tests**:

   Run unit tests with:

   ```bash
   npm run test:unit
   ```

- **End-to-End (E2E) Tests**:

   Run E2E tests with:

   ```bash
   npm run test:e2e
   ```

- **Linting**:

   Run linting checks with:

   ```bash
   npm run lint
   ```

#### CI/CD Pipeline

This project includes a **GitHub Actions** CI/CD pipeline. The pipeline performs the following steps:

1. **Container Setup**: Starts a PostgreSQL container for tests.
2. **Linting**: Runs `npm run lint` to check code formatting.
3. **Unit Testing**: Runs unit tests with `npm run test:unit`.
4. **End-to-End Testing**: Runs E2E tests with `npm run test:e2e`.
5. **Build**: Builds the NestJS app using `npm run build`.
6. **Production Docker Container**: Builds and runs the Docker container.

You can review the workflow file in `.github/workflows/ci.yml`.

---

### Project Details

- **Technology Stack**:
  - **NestJS**: Backend framework.
  - **Prisma**: ORM for PostgreSQL.
  - **JWT**: Authentication using `passport-jwt`.
  - **Docker**: Containerization of the application.
  - **GitHub Actions**: CI/CD pipeline for automated testing and deployment.

---

### API Documentation

The API documentation is automatically generated with **Swagger**.

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api
```

### CI/CD Setup

The pipeline for the project is set up using **GitHub Actions**. Every push or pull request to the `main` branch triggers the following steps:

1. **Check out the code**.
2. **Set up Node.js**.
3. **Install dependencies** and cache them.
4. **Run linting** using `ESLint`.
5. **Run unit tests** and **end-to-end tests** using `Jest`.
6. **Build the Docker image** and deploy it.

---

### Running Tests Locally

To run the tests locally:

1. **Unit Tests**:

   ```bash
   npm run test:unit
   ```

2. **E2E Tests**:

   You can either run them locally with a test database or with Docker:

   ```bash
   npm run test:e2e
   ```

---

### Notes

- **Environment Variables**: Make sure to properly configure your `.env` file with the correct database credentials and JWT secret.
- **Health Check**: The application provides a `/health` endpoint to ensure the server is running correctly.

---

### Contribution Guidelines

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---

### License

This project is licensed under the MIT License.

---

Feel free to modify this document as per your project's final requirements and replace placeholder sections like GitHub repository URL, Docker image name, etc.
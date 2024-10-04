import { execSync } from 'child_process';

module.exports = async () => {
  // Apply migrations to the test database
  console.log(`🚀 Applying migrations to test database: ${process.env.DATABASE_URL}`);
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5433/test_db',
    },
  });
};

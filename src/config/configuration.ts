export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000, // Port for the server
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret', // JWT secret for signing tokens
  database: {
    url: process.env.DATABASE_URL, // Database URL for connecting to PostgreSQL
  },
});

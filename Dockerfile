# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN npm run build

# Stage 2: Serve the application
FROM node:18-alpine AS serve

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

# Run migrations before starting the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

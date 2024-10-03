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

CMD ["node", "dist/main.js"]

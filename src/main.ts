import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; // Helmet para seguridad de encabezados HTTP
import * as csurf from 'csurf'; // CSRF protection
import { ThrottlerGuard } from '@nestjs/throttler'; // Rate Limiting
import { JwtAuthGuard } from './auth/jwt-auth.guard'; // JWT Authentication

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Protección Rate Limiting para evitar abuso (usando ThrottlerGuard)
  app.useGlobalGuards(app.get(ThrottlerGuard));

  // Habilitar Helmet para mejorar la seguridad HTTP (cabezeras seguras)
  app.use(helmet());

  // Habilitar CORS con configuración adecuada (puedes ajustarlo según tus dominios)
  app.enableCors({
    origin: ['https://localhost:3000'], // Dominios permitidos
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true, // Permitir cookies en solicitudes
  });
  

  // Protección CSRF (solo útil si usas autenticación basada en cookies)
  app.use(csurf());

  // Filtro de excepciones globales
  app.useGlobalFilters(new HttpExceptionFilter());



  // Autenticación JWT global (si deseas aplicar a nivel global)
  app.useGlobalGuards(new JwtAuthGuard());

  // Tubo de validación global para sanitizar y validar datos entrantes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar automáticamente propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar tipos de datos
    }),
  );

  // Configuración de Swagger para documentación y prueba de APIs
  const config = new DocumentBuilder()
    .setTitle('Transaction Validation API')
    .setDescription('API for User Authentication and Transaction Management')
    .setVersion('1.0')
    .addBearerAuth() // Habilitar autenticación Bearer para JWT en Swagger
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI en /api

  // Aplicar Rate Limiting (configurado en ThrottlerModule del AppModule)
  // app.useGlobalGuards(new ThrottlerGuard()); // Alternativamente, puedes aplicarlo por ruta
  
  await app.listen(3000);
}

bootstrap();

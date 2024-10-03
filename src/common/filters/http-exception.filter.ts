import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception instanceof HttpException ? errorMessage : 'Internal Server Error',
    };

    // Log the error (with more details for internal server errors)
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Internal Server Error on ${request.url}`, exception['stack']);
    } else {
      this.logger.warn(`Client Error on ${request.url}: ${errorMessage}`);
    }

    // Send the error response to the client
    response.status(status).json(errorResponse);
  }
}

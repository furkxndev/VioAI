import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.resolveException(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, message: payload, error: exception.name };
      }

      const record = payload as Record<string, unknown>;
      return {
        status,
        message: (record.message as string | string[]) ?? exception.message,
        error: (record.error as string) ?? exception.name,
      };
    }

    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as { code?: string } | undefined;
      if (driverError?.code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Bu kayıt zaten mevcut',
          error: 'ConflictError',
        };
      }
      if (driverError?.code === '23503') {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'İlişkili kayıt bulunamadı',
          error: 'ForeignKeyError',
        };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Beklenmeyen bir hata oluştu',
      error: 'InternalServerError',
    };
  }
}

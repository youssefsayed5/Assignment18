import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const DEFAULT_MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'The request is invalid.',
  [HttpStatus.UNAUTHORIZED]: 'You need to log in to access this resource.',
  [HttpStatus.FORBIDDEN]: 'You do not have permission to do this.',
  [HttpStatus.NOT_FOUND]: 'The requested resource was not found.',
  [HttpStatus.CONFLICT]: 'This resource already exists.',
  [HttpStatus.UNPROCESSABLE_ENTITY]:
    'The submitted data could not be processed.',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
  [HttpStatus.INTERNAL_SERVER_ERROR]:
    'Something went wrong on our side. Please try again later.',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') throw exception;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | undefined;
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else {
        const body = res as { message?: string | string[] };
        if (Array.isArray(body.message)) {
          
          errors = body.message;
          message = DEFAULT_MESSAGES[status];
        } else {
          message = body.message;
        }
      }
    } else if ((exception as any)?.code === 11000) {
      
      status = HttpStatus.CONFLICT;
      const fields = Object.keys((exception as any).keyPattern ?? {});
      message = fields.length
        ? `A record with this ${fields.join(', ')} already exists.`
        : DEFAULT_MESSAGES[HttpStatus.CONFLICT];
    } else if ((exception as any)?.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid value for "${(exception as any).path}".`;
    } else if ((exception as any)?.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      errors = Object.values((exception as any).errors ?? {}).map(
        (e: any) => e.message,
      );
      message = DEFAULT_MESSAGES[HttpStatus.BAD_REQUEST];
    }


    if (status >= 500)
      message = DEFAULT_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR];
    message ??= DEFAULT_MESSAGES[status] ?? 'An error occurred.';

    const logLine = `${request.method} ${request.path} - ${
      exception instanceof Error ? exception.message : String(exception)
    }`;
    if (status >= 500) {
      this.logger.error(
        logLine,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logLine);
    }

    if (response.headersSent) return;

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
    });
  }
}

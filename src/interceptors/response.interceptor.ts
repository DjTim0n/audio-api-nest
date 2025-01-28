import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MESSAGE_KEY } from 'src/decorators/message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message =
      this.reflector.get<string>(MESSAGE_KEY, context.getHandler()) ||
      'Success';

    return next.handle().pipe(
      map((data) => ({
        message,
        data: data || null,
      })),
      catchError((error) =>
        throwError(() => ({
          message: error.message || 'Internal server error',
          data: null,
        })),
      ),
    );
  }
}

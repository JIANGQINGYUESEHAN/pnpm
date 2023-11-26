/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs';

interface Response<T> {
  data: T;
}
@Injectable()
export class AppInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();

        const statusCode = response.statusCode || 200;

        const res = {
          statusCode,
          success: true,
          data,
        };
        return res;
      }),
    );
  }
}

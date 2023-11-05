import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Type,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  EntityNotFoundError,
  EntityPropertyNotFoundError,
  QueryFailedError,
} from 'typeorm';
import { isObject } from 'lodash';

@Catch()
export class AppFilter<T extends Error> extends BaseExceptionFilter<T> {
  protected resExceptions: Array<
    { class: Type<Error>; status: number } | Type<Error>
  > = [
    { class: EntityNotFoundError, status: HttpStatus.NOT_FOUND },
    { class: QueryFailedError, status: HttpStatus.BAD_REQUEST },
    { class: EntityPropertyNotFoundError, status: HttpStatus.BAD_REQUEST },
  ];
  catch(exception: T, host: ArgumentsHost) {
    const applicationAdapter =
      this.applicationRef ||
      (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;

    //判断 exception 在不在 resException中
    const resException = this.resExceptions.find((item) => {
      'class' in item
        ? exception instanceof item.class
        : exception instanceof item;
    });
    if (!resException && !(exception instanceof HttpException)) {
      return this.handleUnknownError(exception, host, applicationAdapter);
    }
    let res: string | object = '';
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      res = exception.getResponse();
      statusCode = exception.getStatus();
    } else if (resException) {
      const e = exception as Error;
      res = e.message;
      if ('class' in resException && resException.status) {
        statusCode = resException.status;
      }
    }
    const message = isObject(res) ? res : { res, statusCode };

    applicationAdapter.reply(host.getArgByIndex(1), message, statusCode);
  }
}

import { Module } from '@nestjs/common';
import TypeOrmOptions from './config/databas.option';
import { DatabaseModule } from './module/database.moudle';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AppPipe } from './pipe/app.pipe';
import { AppFilter } from './filter/httpexception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { AccessTokenConfig, Email } from './config/util.config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  FileRepository,
  PostRepository,
  SubscribedsRepository,
  UserRepository,
} from './repository/user.repository';
import * as services from './service';
import * as controller from './controller';

import { GoogleModule } from './oauth/google/module/google.module';
import { Post } from './rss/post/post.entity';
import { subscribed } from './rss/subscribed/subscribed.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { FileEntity } from './entity/file.entity';
import { AppInterceptor } from './interceptor/app.intercepter';
export const jwtModuleRegister = (): JwtModuleOptions => {
  const config = AccessTokenConfig();
  const isProd = 'production';
  const option: JwtModuleOptions = {
    secret: config.TokenConfig.secret,

    verifyOptions: {
      ignoreExpiration: !isProd,
    },
  };
  if (isProd)
    option.signOptions = { expiresIn: `${config.TokenConfig.token_expired}s` };
  return option;
};

@Module({
  imports: [
    DatabaseModule.forRoot(TypeOrmOptions()),
    TypeOrmModule.forFeature([UserEntity, subscribed, Post, FileEntity]),
    GoogleModule,
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 587,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: Email().user,
          pass: Email().pass,
        },
      },
      defaults: {
        from: Email().from,
      },
      preview: false,
    }),
    HttpModule,
    JwtModule.registerAsync({ useFactory: jwtModuleRegister }),
    PassportModule,
    DatabaseModule.forRepository([
      UserRepository,
      SubscribedsRepository,
      PostRepository,
      FileRepository,
    ]),
  ],
  controllers: [...Object.values(controller)],
  exports: [
    ...Object.values(services),

    DatabaseModule.forRepository([
      UserRepository,

      SubscribedsRepository,
      PostRepository,
      FileRepository,
    ]),
  ],
  providers: [
    ...Object.values(services),

    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new AppPipe({
        validationError: { target: true },
        forbidUnknownValues: true,
        transform: true,
        whitelist: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AppFilter,
    },
  ],
})
export class AppModule { }

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { AccessTokenConfig } from 'src/config/util.config';
import * as jwt from 'jsonwebtoken';
export const LoggedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    //获取token
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const config = AccessTokenConfig();
    //token 进行解析
    const obj = jwt.verify(token, config.TokenConfig.secret);

    return {
      id: obj.sub,
    };
  },
);

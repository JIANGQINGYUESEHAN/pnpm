/* eslint-disable prettier/prettier */
import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { TokenService } from 'src/service';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(protected tokenService: TokenService) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);


    if (!token) {
      throw new HttpException('验证失败', 203);
    }

    const IsTrue = await this.tokenService.verifyAccessToken(token);


    return IsTrue;
  }
  protected getRespond(context: ExecutionContext) {
    const Response = context.switchToHttp().getResponse();
    return Response;
  }
  protected getRequest(context: ExecutionContext) {
    const Request = context.switchToHttp().getRequest();
    return Request;
  }
}

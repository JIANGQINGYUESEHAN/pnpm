import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenConfig } from 'src/config/util.config';
const config = AccessTokenConfig();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.TokenConfig.secret,
    });
  }
  // async validate(payload: any) {
  //   return { userId: payload.id, username: payload.username };
  // }
}

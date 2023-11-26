import { HttpException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repository/user.repository';
import * as dayjs from 'dayjs';
import { UserEntity } from 'src/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { AccessTokenConfig, JwtPayload } from 'src/config/util.config';
@Injectable()
export class TokenService {
  constructor(
    protected userRepository: UserRepository,
    protected jwtService: JwtService,
  ) { }
  //生成token
  async generateAccessToken(user: UserEntity, now: dayjs.Dayjs) {
    const config = AccessTokenConfig();
    const accessTokenPayload: JwtPayload = {
      sub: user.id,
      iat: now.unix(),
    };
    const sign = jwt.sign(accessTokenPayload, config.TokenConfig.secret);
    return sign;
  }
  //验证token
  async verifyAccessToken(token) {
    try {
      const config = AccessTokenConfig();
      const result = jwt.verify(token, config.TokenConfig.secret);
      if (!result) return false;
      return true;
    } catch (error) {
      throw new HttpException('验证失败', 201);
    }
  }
}

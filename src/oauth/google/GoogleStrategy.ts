import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GooGle } from 'src/config/oauth.config';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: GooGle().client_id,
      clientSecret: GooGle().client_secret,
      callbackURL: GooGle().redirect_uris[0], // 指定回调URL
      passReqToCallback: true, // 如果需要访问请求对象，可以设置为true
      scope: ['profile', 'email'],
      proxy: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}

// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(protected configure: Configure) {
//       super({
//           clientID: configure.env('GOOGLE_CLIENT_ID', null),
//           clientSecret: configure.env('GOOGLE_CLIENT_SECRET', null),
//           callbackURL: `https://${configure.env('APP_URL')}/google/login`,
//           scope: ['profile', 'email'],
//           proxy: true,
//       });
//   }
// }

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as request from 'request';

import { isNil, has } from 'lodash';
import { GooGle } from 'src/config/oauth.config';
@Injectable()
export class GoogleService {
  constructor() { }

  async googleLogin(req: any) {
    const { data = {} } = (await this.getGoogleUser(req)) as Record<
      string,
      any
    >;
    console.log(data);

    return 1;
    // const nickname = data.name ?? undefined;
  }

  WebRequest(url: string, data: any, method: 'GET' | 'POST'): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response && response.statusCode === 200) {
          resolve(body);
        } else {
          reject(
            'Request failed with status code: ' +
            (response && response.statusCode),
          );
        }
      });
    });
  }
  protected async getGoogleUser(req) {
    if (!has(req.query, 'code')) throw new UnauthorizedException();
    const { code } = req.query as any;

    // 使用 WebRequest 方法发送 POST 请求
    const tokenResponse = await this.WebRequest(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: GooGle().client_id,
        client_secret: GooGle().client_secret,
        redirect_uri: GooGle().redirect_uris,
        grant_type: 'authorization_code',
      },
      'POST',
    );

    const tokenData = JSON.parse(tokenResponse);
    if (!tokenData.access_token) throw new UnauthorizedException();
    const googleToken = tokenData.access_token;

    // 使用 WebRequest 方法发送 GET 请求
    const userInfoResponse = await this.WebRequest(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        access_token: googleToken,
      },
      'GET',
    );

    const googleUser = JSON.parse(userInfoResponse);
    return googleUser as Record<string, any>;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as request from 'request';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpModule, HttpService } from '@nestjs/axios';
import { isNil, has } from 'lodash';
import { GooGle } from 'src/config/oauth.config';
import { AxiosError } from 'axios';
@Injectable()
export class GoogleService {
  // constructor(private httpService: HttpService) { }

  // async googleLogin(req: any) {
  //   const { data = {} } = (await this.getGoogleUser(req)) as Record<
  //     string,
  //     any
  //   >;
  //   console.log(data);

  //   return 1;
  //   // const nickname = data.name ?? undefined;
  // }


  // protected async getGoogleUser(req) {
  //   if (!has(req.query, 'code')) throw new UnauthorizedException();
  //   const { code } = req.query as any;
  //   // 使用 WebRequest 方法发送 POST 请求
  //   const tokenResponse = await this.WebRequest(
  //     'https://oauth2.googleapis.com/token',
  //     {
  //       code,
  //       client_id: GooGle().client_id,
  //       client_secret: GooGle().client_secret,
  //       redirect_uri: GooGle().redirect_uris,
  //       grant_type: 'authorization_code',
  //     },
  //     'POST',
  //   );

  //   if (!has(result, 'data.access_token')) throw new UnauthorizedException();
  //   const googleToken = (result.data as any).access_token;
  //   const googleUser = await firstValueFrom(
  //     this.httpService
  //       .get('https://www.googleapis.com/oauth2/v3/userinfo', {
  //         params: {
  //           access_token: googleToken,
  //           // personFields: 'names,emailAddresses',
  //         },
  //       })
  //       .pipe(
  //         catchError((error: AxiosError) => {
  //           throw new UnauthorizedException();
  //         }),
  //       ),
  //   );
  //   return googleUser as Record<string, any>;
  // }

  // WebRequest(url: string, data: any, method: 'GET' | 'POST'): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const options = {
  //       url,
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     };

  //     request(options, (error, response, body) => {
  //       if (error) {
  //         return reject(error);
  //       }
  //       if (response && response.statusCode === 200) {
  //         resolve(body);
  //       } else {
  //         reject(
  //           'Request failed with status code: ' +
  //           (response && response.statusCode),
  //         );
  //       }
  //     });
  //   });
  // }
}

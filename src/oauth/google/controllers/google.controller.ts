import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { stringify } from 'querystring';

import { GooGle } from 'src/config/oauth.config';
import { GoogleService } from '../services/google.service';

@Controller('/user')
export class AuthController {
  constructor(private googleService: GoogleService) {}

  @Get('/google')
  async googleLogin(@Res() res: any) {
    return res.status(302).redirect(
      `https://accounts.google.com/o/oauth2/auth?${stringify({
        response_type: 'code',
        client_id: GooGle().client_id,
        redirect_uri: GooGle().redirect_uris[0],
        scope: 'profile email',
      })}`,
    );
  }

  @Get('redirect')
  async googleAuthRedirect(@Req() req) {
    return await this.googleService.googleLogin(req);
  }
}

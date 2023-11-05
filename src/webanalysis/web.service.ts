import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common/decorators/core';

import { firstValueFrom } from 'rxjs';
@Injectable()
export class WebService {
  constructor(private httpService: HttpService) {}
  async AnalysisWeb(url: string) {
    const result = await firstValueFrom(this.httpService.get(url));
    console.log(result);
  }
  //解析网页
}

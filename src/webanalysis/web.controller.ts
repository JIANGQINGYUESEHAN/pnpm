import { Body, Controller, Get, Post } from '@nestjs/common';
import { urlDto } from 'src/dto/user.dto';
import { WebService } from './web.service';

@Controller('/webanalysis')
export class WebController {
  constructor(protected readonly webService: WebService) {}
  @Post()
  webAnalysis(@Body() url: urlDto) {
    this.webService.AnalysisWeb(url.url);
  }
}

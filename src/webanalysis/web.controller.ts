import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { urlDto } from 'src/dto/user.dto';
import { WebService } from './web.service';
import { LoggedUser } from 'src/decorator/user.decorator';
import { FileIdDto } from 'src/dto/common.dto';

@Controller('/webanalysis')
export class WebController {
  constructor(protected readonly webService: WebService) { }
  @Post()
  webAnalysis(@Body() url: urlDto, @LoggedUser() UserId) {
    this.webService.AnalysisWeb(url.url, UserId);
  }
  @Get('/findFile')
  FindUserFile(@LoggedUser() UserId) {
    return this.webService.FindUserFile(UserId.id);
  }
  //再次发送
  @Get('/twice/:id')
  Twice(@Param() File: FileIdDto) {
    return this.webService.SendTwice(File.id);
  }
}

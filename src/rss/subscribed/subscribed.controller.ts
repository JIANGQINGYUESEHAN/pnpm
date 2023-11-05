import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { registerRequestDto } from './dto/register.dto';
import { SubscribedService } from './subscribed.service';
import { LoggedUser } from 'src/decorator/user.decorator';
import { commonResponseDto } from 'src/dto/common.dto';
import { UserEntity } from 'src/entity/user.entity';

@Controller('/subscribed')
export class SubscribedController {
  constructor(private readonly subscribedService: SubscribedService) {}

  @Post('/register')
  async register(
    @Body() params: registerRequestDto,
    @LoggedUser() loggedUser: UserEntity,
  ) {
    return this.subscribedService.register({
      url: params.url,
      loggedUser,
      serviceOn: null,
    });
  }
}

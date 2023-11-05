import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReqUser } from 'src/decorator/requser.decorator';
import {
  LoginDto,
  RegisterUserDto,
  UpdateDto,
  UpdatePasswordDto,
} from 'src/dto/user.dto';
import { JwtGuard } from 'src/guard/App.guard';
import { UserService } from 'src/service';

@Controller('/users')
export class UserController {
  constructor(protected userService: UserService) {}
  @Post('/register')
  @HttpCode(200)
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }
  @Post('/login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    console.log(loginDto);

    return this.userService.login(loginDto);
  }

  //更新用户
  @UseGuards(JwtGuard)
  @Post('/update')
  @HttpCode(200)
  updateUser(@Body() updateDto: UpdateDto, @ReqUser() userId) {
    //console.log(userId);

    return this.userService.UpdateUser(updateDto, userId);
  }

  //跟新密码
  @UseGuards(JwtGuard)
  @Post('/updatePassword')
  @HttpCode(200)
  async UpdatePassword(
    @Body() updatePassword: UpdatePasswordDto,
    @ReqUser() userId,
  ) {
    console.log(userId);
    console.log(updatePassword);
    //获取 原来的密码
    return this.userService.fixPassword(updatePassword, userId);
  }
  //获取用户详情
  @UseGuards(JwtGuard)
  @Get('/detail')
  @HttpCode(200)
  GetDetail(@ReqUser() userId) {
    return this.userService.GetDetail(userId);
  }
}

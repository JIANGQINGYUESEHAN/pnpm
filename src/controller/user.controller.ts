/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReqUser } from 'src/decorator/requser.decorator';
import {
  LoginDto,
  RegisterGoogleOrAppleDto,
  RegisterUserDto,
  UpdateDto,
  UpdatePasswordDto,
  userExistDto,
} from 'src/dto/user.dto';
import { JwtGuard } from 'src/guard/App.guard';
import { UserService } from 'src/service';

@Controller('/users')
export class UserController {
  constructor(protected userService: UserService) { }
  @Post('/register')
  @HttpCode(200)
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }
  @Post('/login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
  @Get('/verify/:token')
  async verifyEmail(@Param('token') token: string) {
    // 验证令牌并更新用户状态
    return await this.userService.verifyTokenAndCreateUser(token);
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
    //获取 原来的密码
    return this.userService.fixPassword(updatePassword, userId);
  }
  //获取用户详情
  @UseGuards(JwtGuard)
  @Get('/detail')
  @HttpCode(200)
  async GetDetail(@ReqUser() userId) {
    return await this.userService.GetDetail(userId);
  }
  //谷歌或者苹果登录的直接注册不需要验证
  @Post('/registerForGoogleOrApple')
  @HttpCode(200)
  registerForGoogleOrApple(@Body() registerUserDto: RegisterGoogleOrAppleDto) {
    return this.userService.registerForGoogleOrApple(registerUserDto);
  }
  //查询该用户是否存在
  @Post('/exist')
  @HttpCode(200)
  async GetEXist(@Body() userExist: userExistDto) {
    return await this.userService.UserExist(userExist);
  }

  //查询该用户的所有传输的所有文件
  //获取用户详情
  @UseGuards(JwtGuard)
  @Post('/userFile')
  async UserFileAll(@ReqUser() userId) {
    return this.userService.UserFileAll(userId);
  }

  //删除该文件
  @UseGuards(JwtGuard)
  @Post('/deleteUserFile')
  async deleteUserFileById(@ReqUser() userId, @Body() fileId: any) {
    return this.userService.deleteUserFileById(userId, fileId);
  }
}

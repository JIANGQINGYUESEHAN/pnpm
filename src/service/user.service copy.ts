/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import {
  LoginDto,
  RegisterUserDto,
  UpdateDto,
  UpdatePasswordDto,
} from 'src/dto/user.dto';
import { UserRepository } from 'src/repository/user.repository';
import { isNil } from 'lodash';
import { TokenService } from './token.service';
import * as dayjs from 'dayjs';
import { UpdateResult } from 'typeorm';
import CommonException, { uuid } from 'src/config/util.config';
import { UserEntity } from 'src/entity/user.entity';
import { EmailService } from 'src/Email/Email.service';

@Injectable()
export class UserService {
  protected tokens = [];
  constructor(
    protected userRepository: UserRepository,
    protected tokenService: TokenService,
    protected emailService: EmailService,
  ) { }
  //注册用户
  async register(registerUserDto: RegisterUserDto) {
    try {
      //先验证邮件
      const token = uuid();
      this.tokens.push(token);

      await this.emailService.sendVerificationEmail(
        registerUserDto.email,
        token,
      );


      const item = await this.userRepository.save(registerUserDto, {
        reload: true,
      });
      if (isNil(item)) {
        throw new HttpException('注册失败', 201);
      }
      return '注册成功';
    } catch (error) { }
  }
  verifyToken(receivedToken: string) {
    try {
      const tokenIndex = this.tokens.indexOf(receivedToken);

      if (tokenIndex > -1) {
        this.tokens.splice(tokenIndex, 1); // 如果找到了令牌，删除它
        return { success: true, message: 'Token verified successfully.' };
      } else {
        throw new HttpException(
          { success: false, message: 'Invalid or expired token.' },
          201,
        ); // 令牌不存在，返回错误
      }
    } catch (error) { }
  }
  //登录
  async login(loginDto: LoginDto) {
    try {
      //跟据 username 查询 数据 和密码 对比密码  返回token
      const result = await this.userRepository
        .createQueryBuilder('user')
        .where({ username: loginDto.username })
        .getOne();
      //比较密码

      if (!result) {
        throw new HttpException('密码或者账户错误,请重新登录', 201);
      }
      //返回token
      const now = dayjs();
      const token = await this.tokenService.generateAccessToken(result, now);

      return token;
    } catch (error) { }
  }
  //跟新用户
  async UpdateUser(updateDto: UpdateDto, userId: string) {

    try {
      // 获取qb
      const qb = await this.userRepository.createQueryBuilder();
      // console.log(qb); // 打印生成的 SQL 查询语句，用于调试
      //return qb
      //   // 进行更新操作
      const result: UpdateResult = await qb
        .update()
        .set({ ...updateDto })
        .where('id = :id', { id: userId })
        .execute();
      console.log(result);

      if (result.affected === 0) {
        throw new Error('User not found or update operation failed.'); // 抛出错误，指示更新失败
      }

      return {
        result,
        msg: '更新成功',
      };
    } catch (error) {
      console.error(error); // 打印错误消息或异常信息，用于调试
      throw error; // 重新抛出异常，以便在调用方进行进一步处理
    }
  }
  //修改密码
  async fixPassword(oldPassword: UpdatePasswordDto, id) {
    const qb = await this.userRepository.createQueryBuilder();
    const item = await qb.where({ id }).getOne();
    if (!item) return 'token 错误';
    if (item.password == oldPassword.newPassword) return '密码不应该相同';
    try {
      // 获取qb
      const qb = await this.userRepository.createQueryBuilder();

      // 进行更新操作
      const result: UpdateResult = await qb
        .update()
        .set({ password: oldPassword.newPassword })
        .where('id = :id', { id })
        .execute();
      // console.log(result);

      if (result.affected === 0) {
        throw new Error('User not found or update operation failed.'); // 抛出错误，指示更新失败
      }

      return {
        result,
        msg: '更新成功',
      };
    } catch (error) {
      console.error(error); // 打印错误消息或异常信息，用于调试
      throw error; // 重新抛出异常，以便在调用方进行进一步处理
    }
  }
  //获取用户详情
  async GetDetail(credential) {
    const item = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :credential', { credential })
      .orWhere('user.email = :credential', { credential })
      .orWhere('user.phone = :credential', { credential })
      .orWhere('user.id = :credential', { credential })
      .getOne();
    if (!item) {
      throw new CommonException('获取失败 请重新输入');
    }
    return item;
  }
  //将普通用户变为vip
  async ChangeVip(id) {
    try {
      const result = this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ isVip: true })
        .where({ id })
        .execute();
      console.log(result);
    } catch (error) { }
  }
  //查看所有vip
  FindAllVip() {
    const result = this.userRepository
      .createQueryBuilder('user')
      .where('user.isVip IS NOT NULL')
      .getMany();
    return result;
  }
}

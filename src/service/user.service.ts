/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  LoginDto,
  RegisterGoogleOrAppleDto,
  RegisterUserDto,
  UpdateDto,
  UpdatePasswordDto,
  userExistDto,
} from 'src/dto/user.dto';
import { FileRepository, UserRepository } from 'src/repository/user.repository';
import { isNil } from 'lodash';
import { TokenService } from './token.service';
import * as dayjs from 'dayjs';
import { UpdateResult } from 'typeorm';
import CommonException, { uuid } from 'src/config/util.config';
import { UserEntity } from 'src/entity/user.entity';
import { EmailService } from 'src/Email/Email.service';
import { email } from '../config/util.config';
interface UserToken {
  token: string;
  registerUser: RegisterUserDto;
}
@Injectable()
export class UserService {
  protected userToken: UserToken[] = [];
  constructor(
    protected userRepository: UserRepository,
    protected tokenService: TokenService,
    protected emailService: EmailService,
    protected fileRepository: FileRepository,
  ) { }
  //注册用户
  async register(registerUserDto: RegisterUserDto) {
    try {
      // 生成验证令牌
      const token = uuid();

      this.userToken.push({ token, registerUser: registerUserDto });
      // 发送验证邮件
      await this.emailService.sendVerificationEmail(
        registerUserDto.email,
        token,
      );

      return { token, message: '请验证您的邮箱' };
    } catch (error) {
      throw new HttpException(
        '注册过程中出现错误',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async verifyTokenAndCreateUser(receivedToken: string) {
    try {
      //获取当前token
      const verifyToken = this.userToken.find((item) => {
        return receivedToken == item.token;
      });
      if (verifyToken) {
        //删除用过的token
        this.userToken = this.userToken.filter((item) => {
          return receivedToken != item.token;
        });

        // 验证成功后创建用户
        const user = await this.userRepository.save(verifyToken.registerUser, {
          reload: true,
        });
        if (!user) {
          throw new HttpException(
            '创建用户失败',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return { success: true, message: '用户注册成功' };
      } else {
        throw new HttpException(
          '验证过程中出现错误',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException(
        '验证过程中出现错误',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //谷歌和苹果用户进行登录注册
  async registerForGoogleOrApple(registerUserDto: RegisterGoogleOrAppleDto) {
    const item = await this.userRepository.save(registerUserDto, {
      reload: true,
    });
    if (isNil(item)) {
      throw new HttpException('注册失败', 201);
    }
    return '注册成功';
  }

  async login(loginDto: LoginDto) {
    try {
      const userWithPassword = await this.userRepository
        .createQueryBuilder('user')
        .where({ username: loginDto.username })
        .addSelect('user.password') // 明确指定要选择密码列
        .getOne();

      if (userWithPassword) {
        if (userWithPassword.password == loginDto.password) {
          //返回token
          const now = dayjs();
          const token = await this.tokenService.generateAccessToken(
            userWithPassword,
            now,
          );

          return token;
        } else {
          throw new HttpException('密码错误', 201);
        }
      } else {
        throw new HttpException('请输入正确的用户名或者密码', 201);
      }
    } catch (error) { }
  }

  //跟新用户
  async UpdateUser(updateDto: UpdateDto, userId: string) {
    console.log(userId);
    //       createQueryBuilder()
    // .update(User)
    // .set({ firstName: "Timber", lastName: "Saw" })
    // .where("id = :id", { id: 1 })
    // .execute();
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
      .orWhere('user.username = :credential', { credential })
      .orWhere('user.email = :credential', { credential })
      .orWhere('user.phone = :credential', { credential })
      .orWhere('user.id = :credential', { credential })
      .getOne();
    if (!item) {
      throw new CommonException('获取失败 请重新输入');
    }
    delete item.password;
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
  //查询该用户
  async UserExist(userExist: userExistDto) {
    try {
      //跟据 username 查询 数据 和密码 对比密码  返回token
      const result = await this.userRepository
        .createQueryBuilder('user')
        .where({ username: userExist.username })
        .andWhere({ email: userExist.email })
        .getOne();

      if (result == null) {
        return {
          msg: '请验证邮箱',
          code: 201,
        };
      }
      return true;
    } catch (error) { }
  }
  //查询该用户的所有文件
  async UserFileAll(userId) {
    const user = await this.GetDetail(userId);
    const res = await this.fileRepository
      .createQueryBuilder('file')
      .where({ user })
      .getMany();
    if (!Array.isArray(res)) {
      throw new HttpException('请检查登录状态', 201);
    }
    return res;
  }
  //根据该用户传过来的进行删除

  async deleteUserFileById(userId: number, fileId: number) {
    const user = await this.GetDetail(userId);
    // 首先，检查文件是否存在并且属于该用户
    const file = await this.fileRepository
      .createQueryBuilder('file')
      .where({ id: fileId, user: user })
      .getOne();

    // 如果文件不存在或不属于该用户，抛出异常
    if (!file) {
      throw new HttpException('文件不存在或不属于该用户', 404);
    }

    // 如果一切正常，执行删除操作
    await this.fileRepository.remove(file);

    // 返回一些响应或确认信息
    return { message: '文件已成功删除' };
  }
}

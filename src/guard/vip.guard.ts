/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { AccessTokenConfig, CommonNumber, VipNumber } from 'src/config/util.config';
import { FileRepository, UserRepository } from 'src/repository/user.repository';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class VipGuard implements CanActivate {
    constructor(
        protected fileRepository: FileRepository,
        protected userRepository: UserRepository,

    ) { }
    async canActivate(context: ExecutionContext) {
        try {
            //获取token
            const request = context.switchToHttp().getRequest();
            const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
            if (!token) {
                throw new HttpException("请先登录", 301)
            }
            //根据token解析到当前用户的id
            const config = AccessTokenConfig();
            //token 进行解析
            const { sub } = jwt.verify(token, config.TokenConfig.secret);
            //先根据id 查询出是否是vip
            const { isVip } = await this.userRepository
                .createQueryBuilder("user")
                .select("user.isVip")
                .where("user.id = :id", { id: sub })
                .getOne();
            if (!isVip) {
                //判断当前用户的每月发送文件超过3000
                return this.hasUserSentOverVipNumberFiles(sub, VipNumber)
            }
            return this.hasUserSentOverVipNumberFiles(sub, CommonNumber)




        } catch (error) {
            throw new HttpException(error, 301)
        }
    }
    private async hasUserSentOverVipNumberFiles(userId, Number) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 在JavaScript中，月份是从0开始的（0表示一月）

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const fileCount = await this.fileRepository
            .createQueryBuilder("file")
            .where("file.user_id = :userId", { userId })
            .andWhere("file.createdAt >= :startDate", { startDate })
            .andWhere("file.createdAt <= :endDate", { endDate })
            .getCount();

        return fileCount < Number;
    }
}

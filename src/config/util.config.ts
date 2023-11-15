import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

//密码加密
export function encryption(password: string) {
  return bcrypt.hashSync(password, 10);
}
//密码解密
export function decrypt(password: string, comparePassword: string) {
  return bcrypt.compareSync(password, comparePassword);
}
//token配置

export interface UserConfigInterface {
  hash: 10;
  TokenConfig: JwtConfig;
}
export interface JwtConfig {
  secret: string;
  token_expired: number;
}
export interface JwtPayload {
  sub: string;
  iat: number;
}
export const AccessTokenConfig = (): UserConfigInterface => {
  return {
    hash: 10,
    TokenConfig: {
      secret: 'b9c7183-790f-4897-a2d6-df96df75991c',
      token_expired: 3600,
    },
  };
};

export enum StatusCode {
  Success = 200,
  Error = 403,
  SocketConnectError = 205,
}
export default class CommonException extends HttpException {
  constructor(msg: string, statusCode = StatusCode.Error) {
    super({ statusCode, message: msg }, StatusCode.Error);
  }
}

export enum requestMethod {
  POST = 'post',
  GET = 'get',
}
export type RequestOptions = {
  url: string; //请求的URL地址
  method: requestMethod; //请求的方法
  json?: boolean; //JSON，希望返回的数据是一个JSON格式的
  headers?: any;
  body?: any; //请求体
};
export const email = '3325246991_YRA3XX@kindle.com';
export const PageTitle = 'I am sb';
export type UserSelect = {
  username?: string;
  email?: string;
};

export enum TimeFormat {
  WEEK = 'week',
  MONTH = 'month',
}
export function uuid() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid;
}
export const VipNumber = 300;
export const CommonNumber = 200;
export const TaskVipNumber = 30;
export const TaskCommonNumber = 20;
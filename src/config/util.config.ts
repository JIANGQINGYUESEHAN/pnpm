import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

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

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
export enum Type {
  friend = 'friend',
  group = 'group',
}
export type friendRecentChat = {
  id: string | number;
  avatarSrc: string;
  name: string;
  intro: string;
  content: string;
  contentType: MessageType;
  time: string;
  type: Type;
  unreadCount: 0;
};

export type GroupRecentChat = {
  id: string | number;
  groupAvatarSrc: string;
  groupName: string;
  groupIntro: string;
  userId: string;
  userName: string;
  userAvatarSrc: string;
  content: string;
  contentType: MessageType;
  time: string;
  type: Type;
  unreadCount: 0;
};
//每两组生成唯一的id

export const GenerateUniqueRoomId = (senderId, receiverId) => {
  const [max, min] =
    senderId > receiverId ? [senderId, receiverId] : [receiverId, senderId];

  //通过Math生成
  const str = String(Math.atan2(max, min));
  return str.substring(2, 6);
};

export const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

export function getTimeDiff(time: string): string {
  let res = '';
  const diff = dayjs().diff(time, 'minutes');
  if (diff < 60) {
    res = diff + '分钟前';
  } else if (diff > 60 && diff < 24 * 60) {
    const diffs = Math.round(diff / 60);
    res = diffs + '小时前';
  } else if (diff > 24 * 60) {
    const diffs = Math.round((diff / 24) * 60);
    res = diffs + '天前';
  }
  return res;
}

//webSocket返回体

export const successResp = (data, message = '成功') => {
  return { code: StatusCode.Success, data: data, message };
};
export const errorResp = (e) => {
  return {
    code: StatusCode.Error,
    data: null,
    message: e.response?.message || e,
  };
};
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

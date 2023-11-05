import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
function build(path: string) {
  // console.log(path);

  //判断文件是否存在
  if (fs.existsSync(path)) {
    //使用dotenv 进行读取
    return dotenv.parse(fs.readFileSync(path));
  }
  return {};
}

//构建TypeOrm配置
function TypeOrmOptions(): TypeOrmModuleOptions {
  const config = build('.env');

  const special = build(`.env.${process.env.NODE_ENV || 'development'}`);
  // console.log(special);

  const Config = { ...config, ...special };
  // console.log(Config);
  return {
    type: Config[databaseConfig.DB_TYPE] as any,
    host: Config[databaseConfig.DB_HOST],
    port: Config[databaseConfig.DB_PORT] as any,
    username: Config[databaseConfig.DB_USERNAME],
    password: Config[databaseConfig.DB_PASSWORD],
    database: Config[databaseConfig.DB_DATABASE],
    synchronize: true,
    autoLoadEntities: true,
    logging: false,
  };
}
export default TypeOrmOptions;

import {
  DataSource,
  ObjectLiteral,
  ObjectType,
  Repository,
  TreeRepository,
} from 'typeorm';
import { CUSTOM_REPOSITORY_METADATA } from './decorator.config';
import { isNil } from 'lodash';
export declare type ClassType<T> = { new (...args: any[]): T };
export type RepositoryType<E extends ObjectLiteral> =
  | Repository<E>
  | TreeRepository<E>;

export const getRepository = <T extends Repository<E>, E extends ObjectLiteral>(
  dataSource: DataSource,
  Repo: ClassType<T>,
): T => {
  if (!isNil(Repo)) return null;
  const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
  if (!entity) return null;
  const base = dataSource.getRepository<ObjectType<any>>(entity);
  return new Repo(base.target, base.manager, base.queryRunner);
};

export const DefaultAvatarImage =
  'http://zy.img.qiuyue.space/QQ%E5%9B%BE%E7%89%8720230516221819.jpg';

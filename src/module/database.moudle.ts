import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import {
  getDataSourceToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { CUSTOM_REPOSITORY_METADATA } from 'src/config/decorator.config';
import { DataExistConstraintAll } from 'src/constraint/data.exist.constraint';
import { DataExistConstraint } from 'src/constraint/exist.constraint';

import { IsUniqueConstraint } from 'src/constraint/unique.constraint';

import { DataSource, ObjectType } from 'typeorm';
@Module({})
export class DatabaseModule {
  static forRoot(configRegister: TypeOrmModuleOptions): DynamicModule {
    return {
      global: true,
      module: DatabaseModule,
      imports: [TypeOrmModule.forRoot(configRegister)],
      providers: [
        IsUniqueConstraint,
        DataExistConstraint,
        DataExistConstraintAll,
      ],
    };
  }

  /**
   * 注册自定义Repository
   * @param repositories 需要注册的自定义类列表
   * @param dataSourceName 数据池名称,默认为默认连接
   */
  static forRepository<T extends Type<any>>(
    repositories: T[],
    dataSourceName?: string,
  ): DynamicModule {
    const providers: Provider[] = [];

    for (const Repo of repositories) {
      const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);

      if (!entity) {
        continue;
      }
      providers.push({
        inject: [getDataSourceToken(dataSourceName)],
        provide: Repo,
        useFactory: (dataSource: DataSource): InstanceType<typeof Repo> => {
          const base = dataSource.getRepository<ObjectType<any>>(entity);
          return new Repo(base.target, base.manager, base.queryRunner);
        },
      });
    }
    return {
      exports: providers,
      module: DatabaseModule,
      providers,
    };
  }
}

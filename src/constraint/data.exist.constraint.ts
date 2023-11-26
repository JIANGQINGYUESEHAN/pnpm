/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { HttpException, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
  registerDecorator,
} from 'class-validator';
import { DataSource, ObjectType, Repository } from 'typeorm';
type Condition = {
  entity: ObjectType<any>;
  map?: string;
};

@Injectable()
@ValidatorConstraint({ name: 'DataExistConstraintAll', async: true })
export class DataExistConstraintAll implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) { }
  async validate(value: any, args?: ValidationArguments) {
    let repo: Repository<any>;


    if (!value) return false;
    //map 默认为id
    let map = 'id';
    if ('entity' in args.constraints[0]) {
      map = args.constraints[0].map ?? map;
      repo = this.dataSource.getRepository(args.constraints[0].entity);
    } else {
      repo = this.dataSource.getRepository(args.constraints[0]);
    }
    // 通过查询记录是否存在进行验证
    const item = await repo.findOne({ where: { [map]: value } });
    return !!item;
  }

  defaultMessage(args: ValidationArguments): string {
    if (!args.constraints[0]) {
      throw new HttpException('Model not been specified!', 201);
      //return 'Model not been specified!';
    }
    throw new HttpException(
      `All instance of ${args.constraints[0].name} must been exists in databse!`,
      201,
    );
    // return;
  }
}

export function DataExistConstraintById(
  param: Condition | ObjectType<any>,
  args?: ValidatorOptions,
) {

  return (obj: Record<string, any>, propertyName: any) => {
    registerDecorator({
      target: obj.constructor,
      propertyName,
      validator: DataExistConstraintAll,
      options: args,
      constraints: [param],
    });
  };
}

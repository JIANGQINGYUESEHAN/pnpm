/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
  registerDecorator,
} from 'class-validator';
import { DataSource, ObjectType } from 'typeorm';
import { isObject, isNil } from 'lodash';
import * as merge from 'deepmerge';
type Condition = {
  entity: ObjectType<any>;

  property?: string;
};
@ValidatorConstraint({ name: 'DataExist', async: true })
@Injectable()
export class DataExistConstraint implements ValidatorConstraintInterface {
  constructor(protected dataSource: DataSource) { }
  async validate(value: any, args?: ValidationArguments) {
    const config: Omit<Condition, 'entity'> = {
      //获取属性名
      property: args.property,
    };

    const condition: Condition = (
      'entity' in args.constraints[0]
        ? merge(config, args.constraints[0])
        : { ...config, ...args.constraints[0] }
    ) as Required<Condition>;
    if (!condition.entity) return false;

    try {
      //进行查询

      const result = await this.dataSource
        .getRepository(condition.entity)
        .createQueryBuilder()
        .where({ [condition.property]: value })
        .getOne();

      if (!isNil(result)) return true;
    } catch (error) {
      return false;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    const { entity, property } = args.constraints[0];
    const queryProperty = property ?? args.property;
    if (!(args.object as any).getManager) {
      throw new HttpException('getManager function not been found!', 201);
      // return 'getManager function not been found!';
    }
    if (!entity) {
      //  return '';
      throw new HttpException('Model not been specified!', 201);
    }
    throw new HttpException(`${queryProperty} of ${entity.name} must been unique!`, 201);
    // return `${queryProperty} of ${entity.name} must been unique!`;
  }
}
export function DataExist(
  param: Condition | ObjectType<any>,
  args?: ValidatorOptions,
) {
  return (obj: Record<string, any>, propertyName: any) => {
    registerDecorator({
      target: obj.constructor,
      propertyName,
      validator: DataExistConstraint,
      options: args,
      constraints: [param],
    });
  };
}

import { HttpException, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import * as merge from 'deepmerge';
import { DataSource, ObjectType } from 'typeorm';
import { isNil } from 'lodash';
type Condition = {
  entity: ObjectType<any>;
  property?: string;
};

@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(protected dataSource: DataSource) { }
  async validate(value: any, args?: ValidationArguments) {
    const config: Omit<Condition, 'entity'> = {
      //代表要验证的属性的名称。
      property: args.property,
    };
    //合并对象
    console.log(value);

    const condition = ('entity' in args.constraints[0]
      ? merge(config, args.constraints[0])
      : {
        ...config,
        entity: args.constraints[0],
      }) as unknown as Required<Condition>;

    //在判断有没有
    if (!condition.entity) {
      return false;
    }

    try {
      const item = this.dataSource.getRepository(condition.entity);
      const result = await item
        .createQueryBuilder()
        .where({ [condition.property]: value })
        .getOne();

      return isNil(result);
    } catch (error) {
      return false;
    }
  }
  defaultMessage(args?: ValidationArguments): string {
    const { entity, property } = args.constraints[0];
    const queryProperty = property ?? args.property;

    if (!entity) {
      throw new HttpException('Model not been specified!', 201);
      // return 'Model not been specified!';
    }
    throw new HttpException(
      `${queryProperty} of ${entity.username} must been unique!`,
      201,
    );
    // return `${queryProperty} of ${entity.username} must been unique!`;
  }
}
// param: ObjectType<any> | Condition：这是用于指定要验证的实体类或验证条件对象的参数。它可以是一个实体类的类型（ObjectType<any>），也可以是一个验证条件对象（Condition）。

// args?: ValidationOptions：这是一个可选参数，用于指定验证选项的配置对象。ValidationOptions 是 class-validator 库中的一个接口，它包含各种配置验证行为的选项。

// (Obj: Record<string, any>, propertyName: any)：这是装饰器函数的参数，其中：

// Obj：表示被装饰的属性所属的对象，类型为 Record<string, any>。
// propertyName：表示被装饰的属性的名称，类型为 any。

/**
 *
 * @param param 这是用于指定要验证的实体类或验证条件对象的参数
 * @param args 是一个可选参数，用于指定验证选项的配置对象
 * @returns
 */
export function IsUnique(
  param: ObjectType<any> | Condition,
  args?: ValidationOptions,
) {
  /**
   *  @param Obj :这是装饰器函数的参数，其中 Obj：表示被装饰的属性所属的对象，
   *  @param propertyName :表示被装饰的属性的名称，类型为 any，
   */
  return (Obj: Record<string, any>, propertyName: any) => {
    registerDecorator({
      target: Obj.constructor,
      propertyName,
      options: args,
      constraints: [param],
      validator: IsUniqueConstraint,
      // 在装饰器函数内部，调用了 registerDecorator 函数，该函数用于注册装饰器。registerDecorator 函数接受一个配置对象，其中包括以下属性：
      // target: Obj.constructor：表示要装饰的目标类的构造函数。
      // propertyName：表示要装饰的属性的名称。
      // options: args：表示验证选项的配置对象。
      // constraints: [param]：表示装饰器的约束条件，这里将之前的 param 参数作为约束条件传递进去。
      // validator: IsUniqueConstraint：表示要使用的验证器的类。
      // 总结起来，IsUnique 装饰器函数用于注册装饰器，并将装饰器与目标类、属性、验证选项、约束条件和验证器关联起来。
    });
  };
}

import { HttpException, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'RegularValidation' })
export class RegularValidationConstraint
  implements ValidatorConstraintInterface {
  private isValid: boolean = true; // 实例变量，用于跟踪验证结果
  validate(value: any, args?: ValidationArguments): boolean | Promise<boolean> {
    //获取验证规则
    const rex = args.constraints[0];

    //判断是否存在
    if (!rex) {
      this.isValid = false;
      return false;
    }

    //存在的化就行验证
    if (rex.test(value)) {
      this.isValid = true; // 设置 isValid 为 true
      return true;
    } else {
      this.isValid = false;
      return false;
    }
  }
  defaultMessage(args?: ValidationArguments): string {
    const { rex } = args.constraints[0];

    if (!rex) {
      throw new HttpException('Validation rule does not exist', 201);

    } else if (!this.isValid) {
      throw new HttpException('Custom error message for false condition', 201);
      //  return 'Custom error message for false condition';
    }
    // 默认错误消息
    throw new HttpException('Default error message', 201);
    return 'Default error message';
  }
}

export function IsRegular(rex: RegExp, args?: ValidationOptions) {
  return (obj: Record<string, any>, propertyName: any) => {
    registerDecorator({
      target: obj.constructor,
      propertyName,
      options: args,
      constraints: [rex],
      validator: RegularValidationConstraint,
    });
  };
}

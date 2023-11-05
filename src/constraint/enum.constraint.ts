import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { MessageType } from 'src/config/util.config';
@Injectable()
@ValidatorConstraint()
export class IsEnumConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments) {
    //先获取进来的 enum
    const Enum = args.constraints[0];

    console.log(Enum);

    if (typeof Enum == 'undefined') {
      return false;
    }

    //对传进来的值进行 比较  符合就通过
    //对enum进行遍历比较
    return Object.values(Enum).some((item) => {
      // console.log(item ,value);
      return item === value;
    });
  }
  defaultMessage(args?: ValidationArguments): string {
    const Enum = args.constraints[0];
    if (typeof Enum == 'undefined') {
      return '请输入具体判断enum';
    }
  }
}

export default function IsDefaultEnum(value: any, args?: ValidationOptions) {
  return (obj: Record<string, any>, propertyName: any) => {
    registerDecorator({
      target: obj.constructor,
      propertyName,
      validator: IsEnumConstraint,
      options: args,
      constraints: [value],
    });
  };
}

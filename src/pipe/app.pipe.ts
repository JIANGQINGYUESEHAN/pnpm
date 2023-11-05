import {
  ArgumentMetadata,
  Injectable,
  Paramtype,
  ValidationPipe,
} from '@nestjs/common';
import * as merge from 'deepmerge';
import { DTO_VALIDATION_OPTIONS } from 'src/config/decorator.config';
import { isObject, omit, isFunction } from 'lodash';

@Injectable()
export class AppPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { type, metatype } = metadata;
    const dto = metatype as any;
    //获取配置
    const option = Reflect.getMetadata(DTO_VALIDATION_OPTIONS, dto);
    //保存原有的验证规则
    const originTransform = { ...this.transformOptions };
    const originValidator = { ...this.validatorOptions };

    //解构获取的值
    const {
      transformOptions,
      type: optionsType,
      ...customOption
    } = option || {};
    const requestType: Paramtype = optionsType ?? 'body';
    if (requestType !== type) return value;

    //合并验证规则
    if (transformOptions) {
      this.transformOptions = merge(
        this.transformOptions,
        transformOptions ?? {},
        {
          arrayMerge: (_d, _s, o) => _s,
        },
      );
    }
    this.validatorOptions = merge(this.validatorOptions, customOption ?? {}, {
      arrayMerge: (_d, _s, o) => _s,
    });

    const toValidation = isObject(value)
      ? Object.fromEntries(
          Object.entries(value as Record<string, any>).map(([key, v]) => {
            if (!isObject(v) || !('mimetype' in v)) return [key, v];
            return [key, omit(v, ['fields'])];
          }),
        )
      : value;
    let result = await super.transform(toValidation, metadata);
    if (typeof result.transform == 'function') {
      result = result.transform(result);
      const { transform, ...data } = result;
      result = data;
    }

    this.transformOptions = originTransform;
    this.validatorOptions = originValidator;

    return result;
  }
}

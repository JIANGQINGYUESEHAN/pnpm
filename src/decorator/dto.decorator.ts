import { Paramtype, SetMetadata } from '@nestjs/common';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import { TransformOptions } from 'class-transformer';
import { DTO_VALIDATION_OPTIONS } from 'src/config/decorator.config';

export const DtoDecorator = (
  option?: ValidatorOptions & { transformOption?: TransformOptions } & {
    type: Paramtype;
  },
) => {
  return SetMetadata(DTO_VALIDATION_OPTIONS, option ?? {});
};

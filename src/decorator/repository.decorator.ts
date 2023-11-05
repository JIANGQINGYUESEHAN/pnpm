import { SetMetadata } from '@nestjs/common';
import { CUSTOM_REPOSITORY_METADATA } from 'src/config/decorator.config';
import { ObjectLiteral, ObjectType } from 'typeorm';

export const CustomRepository = <T>(entity: ObjectType<T>) => {
  return SetMetadata(CUSTOM_REPOSITORY_METADATA, entity);
};

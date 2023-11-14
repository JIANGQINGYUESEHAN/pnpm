/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body } from '@nestjs/common';
import { IsNumber, IsString } from 'class-validator';
import { TimeFormat } from 'src/config/util.config';
import { DataExistConstraintById } from 'src/constraint/data.exist.constraint';
import IsDefaultEnum from 'src/constraint/enum.constraint';
import { IsRegular } from 'src/constraint/regular.constraint';
import { DtoDecorator } from 'src/decorator/dto.decorator';

import { FileEntity } from 'src/entity/file.entity';

export class commonResponseDto {
  statusCode: any;
  message: string;
  error?: string;
}
@DtoDecorator({ type: 'param' })
export class FileIdDto {
  @DataExistConstraintById({ entity: FileEntity })
  id: string;
}

@DtoDecorator({ type: 'body' })
export class TaskIntervalDto {
  @IsRegular(
    /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
  )
  @IsString()
  url: string;
  @IsNumber()
  @IsRegular(/^(?:[0-9]|1[0-9]|2[0-4])$/)
  Date: number;
  @IsDefaultEnum(TimeFormat)
  cycle: string;
  // @DataExistConstraintById({ entity: UserEntity })
  @IsRegular(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsString()
  email: string;
}
@DtoDecorator({ type: 'param' })
export class IdDto {
  @DataExistConstraintById(FileEntity)
  @IsString()
  id: string;
}
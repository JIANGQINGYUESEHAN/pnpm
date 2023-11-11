import { DataExistConstraintById } from 'src/constraint/data.exist.constraint';
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

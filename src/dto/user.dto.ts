import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  isString,
} from 'class-validator';
import { DataExist } from 'src/constraint/exist.constraint';
import { IsRegular } from 'src/constraint/regular.constraint';
import { IsUnique } from 'src/constraint/unique.constraint';
import { DtoDecorator } from 'src/decorator/dto.decorator';
import { UserEntity } from 'src/entity/user.entity';

@DtoDecorator({ type: 'body' })
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 8, { message: '用户名长度不符合要求' })
  @IsUnique({ entity: UserEntity })
  username: string;
  @IsString()
  @IsNotEmpty()
  @IsUnique({ entity: UserEntity })
  @IsRegular(/^1[3-9]\d{9}$/)
  phone: string;
  @IsString()
  @IsNotEmpty()
  //判断是否符合条件
  @IsRegular(/^[a-zA-Z0-9]{8}$/)
  @IsString()
  @Length(8, 8, { message: '密码长度不符合要求' })
  password: string;
}
@DtoDecorator({ type: 'body' })
export class LoginDto {
  @IsNotEmpty({ message: '用户名不为空' })
  @IsString({ message: '字符串' })
  @DataExist({ entity: UserEntity })
  username: string;

  @IsRegular(/^[a-zA-Z0-9]{8}$/)
  @IsString()
  @IsNotEmpty({ message: '密码不为空' })
  password: string;
}

//更新用户的选项
@DtoDecorator({ type: 'body' })
export class UpdateDto {
  @IsString()
  @Length(1, 8, { message: '用户名长度不符合要求' })
  @IsUnique({ entity: UserEntity })
  @IsOptional()
  username?: string;

  @IsUnique({ entity: UserEntity })
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsUnique({ entity: UserEntity })
  phone?: string;
  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

//更新密码
@DtoDecorator({ type: 'body' })
export class UpdatePasswordDto {
  @IsRegular(/^[a-zA-Z0-9]{8}$/)
  @IsString()
  newPassword: string;
}
@DtoDecorator({ type: 'body' })
export class urlDto {
  @IsRegular(
    /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
  )
  @IsString()
  url: string;
}

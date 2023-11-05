import { UserEntity } from 'src/entity/user.entity';
import { Post } from '../post.entity';
import { commonResponseDto } from 'src/dto/common.dto';

export class GetPostsRequestDto {
  loggedUser: UserEntity;
}

export class GetPostsResponseDto extends commonResponseDto {
  posts?: Post[];
}

export class GetThumbnailAfterParsingResponseDto extends commonResponseDto {
  thumbnail?: string | null;
}

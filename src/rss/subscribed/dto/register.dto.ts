import { commonResponseDto } from 'src/dto/common.dto';
import { UserEntity } from 'src/entity/user.entity';

export class registerRequestDto {
  url: string;
  //loggedUserId: number;
  loggedUser: UserEntity;
  serviceOn: string | null;
}

export class getRssAddressResponseDto extends commonResponseDto {
  feedUrl: string;
}
export class parsingRSSResponseDto extends commonResponseDto {
  data?: {
    title: string;
    siteUrl: string;
    serviceOn: string | null;
    feedUrl: string;
    profileImageUrl: string | null;
  };
}

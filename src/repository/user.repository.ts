import { CustomRepository } from 'src/decorator/repository.decorator';
import { GoogleAuthInfo } from 'src/entity/google.entity';
import { UserEntity } from 'src/entity/user.entity';
import { Post } from 'src/rss/post/post.entity';
import { subscribed } from 'src/rss/subscribed/subscribed.entity';

import { Repository } from 'typeorm';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  BaseQuery() {
    return this.createQueryBuilder('user');
  }
}

@CustomRepository(GoogleAuthInfo)
export class GoogleAuthInfoRepository extends Repository<GoogleAuthInfo> {}
@CustomRepository(subscribed)
export class SubscribedsRepository extends Repository<subscribed> {}

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {}


import { CustomRepository } from 'src/decorator/repository.decorator';
import { FileEntity } from 'src/entity/file.entity';

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

@CustomRepository(subscribed)
export class SubscribedsRepository extends Repository<subscribed> { }

@CustomRepository(Post)
export class PostRepository extends Repository<Post> { }
@CustomRepository(FileEntity)
export class FileRepository extends Repository<FileEntity> { }

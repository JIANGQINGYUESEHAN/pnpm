import { UserSelect } from 'src/config/util.config';
import { CustomRepository } from 'src/decorator/repository.decorator';
import { FileEntity } from 'src/entity/file.entity';
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
export class GoogleAuthInfoRepository extends Repository<GoogleAuthInfo> { }
@CustomRepository(subscribed)
export class SubscribedsRepository extends Repository<subscribed> { }

@CustomRepository(Post)
export class PostRepository extends Repository<Post> { }
@CustomRepository(FileEntity)
export class FileRepository extends Repository<File> {
  //查询当前用户的所有发送的文件
  base() {
    return this.createQueryBuilder();
  }
  //查询当前用户的所有发送的文件
  async findCurrentFile(user: UserEntity) {
    const result = await this.createQueryBuilder()
      .where({ user: user })
      .getMany();

    return result;
  }
}

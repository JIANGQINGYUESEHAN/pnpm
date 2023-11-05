import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';

import { LoggedUser } from 'src/decorator/user.decorator';
import { UserEntity } from 'src/entity/user.entity';

@Controller('/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/getPosts')
  async login(@LoggedUser() loggedUser: UserEntity) {
    return this.postService.getPosts({ loggedUser });
  }
}

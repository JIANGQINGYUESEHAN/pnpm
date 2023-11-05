import { Injectable } from '@nestjs/common';

import {
  GetPostsRequestDto,
  GetThumbnailAfterParsingResponseDto,
} from './dto/getPosts.dto';

import * as cheerio from 'cheerio';
import * as request from 'request-promise';
import * as rssReader from 'rss-parser';

import {
  PostRepository,
  SubscribedsRepository,
} from 'src/repository/user.repository';
@Injectable()
export class PostService {
  constructor(
    private readonly subscribeds: SubscribedsRepository,
    private readonly posts: PostRepository,
  ) { }

  async getThumbnailAfterParsing(
    url: string,
  ): Promise<GetThumbnailAfterParsingResponseDto> {
    if (
      url.toLowerCase().includes('m.blog.naver.com') ||
      url.toLowerCase().includes('blog.naver.com') ||
      url.toLowerCase().includes('m.blog.naver.com')
    ) {
      const parseNaverPostURL = url.split('/').reverse();
      const naverSpecificTag = parseNaverPostURL[1];
      const naverPostSpecificNo = parseNaverPostURL[0];

      url = `https://blog.naver.com/PostView.naver?blogId=${naverSpecificTag}&logNo=${naverPostSpecificNo}`;
    }

    try {
      const res = await request({ uri: url, rejectUnauthorized: false }).then(
        async (html) => {
          const $ = await cheerio.load(html);
          const isAbleSubscribe = $("meta[property*='og:image']").length;

          if (isAbleSubscribe > 0) {
            const thumbnail = $("meta[property*='og:image']")[0].attribs
              .content;

            return {
              statusCode: 200,
              message: '成功提取缩略图。',
              thumbnail,
            };
          } else {
            return {
              statusCode: 404,
              message: '未发现缩略图。',
              error: '在帖子上找不到缩略图',
            };
          }
        },
      );

      return res;
    } catch (error) {
      return {
        statusCode: 500,
        message: '在提取缩略图时出现错误。',
        error: '在提取缩略图时出现意外错误',
      };
    }
  }

  async renewalPostsByUserId(id: number) {
    const now = Math.floor(new Date().getTime() / 1000);

    try {
      const allSubscribed = await this.subscribeds
        .createQueryBuilder('subscribed')
        .leftJoinAndSelect('subscribed.followers', 'follower')
        .where(
          'follower.id in (:id) \
            AND ((:now) - subscribed.renewalTime > 60000)',
          {
            id,
            now,
          },
        )
        .getRawMany();

      if (allSubscribed && allSubscribed.length > 0) {
        const parser = new rssReader({
          requestOptions: {
            rejectUnauthorized: false,
          },
        });

        await Promise.all(
          allSubscribed.map(async (subscribe, i) => {
            const parseRSSData = await parser.parseURL(
              subscribe.subscribed_feedUrl.replace('https://', 'http://'),
            );

            allSubscribed[i]['rssData'] = parseRSSData;
          }),
        );

        allSubscribed.map(async (subscribe) => {
          if (subscribe.rssData.items && subscribe.rssData.items.length > 0) {
            await Promise.all(
              subscribe.rssData.items.map(async (post) => {
                // eslint-disable-next-line
                let postFormat = {
                  title: post.title,
                  thumbnail: null,
                  description: null,
                  writtenDate: post.pubDate, // 'Sun, 04 Jul 2021 23:51:44 +0900'
                  postUrl: post.link,
                };

                // 1. 从原始内容中删除HTML标记
                const description = post.contentSnippet.replace(/\n/gi, ' ');

                // 2. 截取描述（100字）
                if (description.length > 100) {
                  postFormat.description = `${description.substring(
                    0,
                    100,
                  )}...`;
                }

                const getThumbnailRes = await this.getThumbnailAfterParsing(
                  post.link,
                );

                if (getThumbnailRes && getThumbnailRes.statusCode === 200) {
                  postFormat.thumbnail = getThumbnailRes.thumbnail;
                }

                const alreadySub = await this.posts
                  .createQueryBuilder()
                  .where({
                    id: subscribe.subscribed_id,
                  })
                  .getOne();

                const alreadyPosts = await this.posts
                  .createQueryBuilder()
                  .where({ postUrl: post.link })
                  .getOne();

                if (alreadyPosts) {
                  alreadyPosts.title = postFormat.title;
                  alreadyPosts.thumbnail = postFormat.thumbnail;
                  alreadyPosts.description = postFormat.description;
                  alreadyPosts.writtenDate = postFormat.writtenDate;

                  await this.posts.save(alreadyPosts);
                } else {
                  await this.posts.save({
                    title: postFormat.title,
                    thumbnail: postFormat.thumbnail,
                    description: postFormat.description,
                    postUrl: postFormat.postUrl,
                    writtenDate: postFormat.writtenDate,
                    subscribed: alreadySub,
                  });
                }
              }),
            );
          }
        });
      }

      return {
        statusCode: 200,
        message: '帖子信息已更新。',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: '更新帖子信息时出错。',
        error: '在解析帖子时发生了意外错误',
      };
    }
  }

  //: Promise<GetPostsResponseDto>
  async getPosts(params: GetPostsRequestDto) {
    // 根据条件（刷新周期）更新新帖子的存储/更新
    const id = parseInt(params.loggedUser.id);
    await this.renewalPostsByUserId(id);

    const allSubscribed = await this.subscribeds
      .createQueryBuilder('subscribed')
      .leftJoin('subscribed.followers', 'follower')
      .leftJoin('subscribed.posts', 'postList')
      .select([
        'subscribed.id AS blogUniqueId',
        'subscribed.title AS blogName',
        'subscribed.siteUrl AS blogUrl',
        'subscribed.profileImageUrl AS blogProfileImage',
        'subscribed.serviceOn AS servingFrom',
        'postList.id AS postUniqueId',
        'postList.title AS title',
        'postList.thumbnail AS thumbnail',
        'postList.description AS description',
        'postList.writtenDate AS writtenDate',
      ])
      .where('follower.id in (:id)', {
        id: params.loggedUser.id,
      })
      .getRawMany();

    return allSubscribed;
  }
}

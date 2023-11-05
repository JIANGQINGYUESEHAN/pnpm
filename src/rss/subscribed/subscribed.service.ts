import { registerRequestDto } from './dto/register.dto';

import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import * as rssReader from 'rss-parser';
import * as queryString from 'query-string';
import { Injectable } from '@nestjs/common/decorators/core';

import { SubscribedsRepository } from 'src/repository/user.repository';
import { subscribed } from './subscribed.entity';

@Injectable()
export class SubscribedService {
  constructor(private subscribeds: SubscribedsRepository) { }

  async getRssAddress(url: string) {
    const res = await request({ uri: url, rejectUnauthorized: false }).then(
      async (html) => {
        const $ = await cheerio.load(html);
        const isAbleSubscribe = $("link[type*='application/rss']").length;
        const isAbleSubscribeXml = $(
          "link[type*='application/rss+xml']",
        ).length;

        if (isAbleSubscribe > 0 || isAbleSubscribeXml > 0) {
          let feedUrl;

          if (isAbleSubscribe > 0) {
            feedUrl = $("link[type*='application/rss']")[0].attribs.href;
          } else {
            feedUrl = $("link[type*='application/rss+xml']")[0].attribs.href;
          }

          return {
            statusCode: 200,
            message: '成功找到RSS地址。',
            feedUrl,
          };
        } else {
          return {
            statusCode: 500,
            message: '未找到RSS地址。',
            error: '未找到RSS地址',
          };
        }
      },
    );

    return res;
  }

  async parsingRSS({ url, serviceOn }) {
    try {
      const parser = new rssReader();
      const rssData = await parser.parseURL(url.replace('https://', 'http://'));

      return {
        statusCode: 200,
        message: '成功注册。',
        data: {
          title: rssData.title,
          siteUrl: rssData.link,
          serviceOn,
          feedUrl: url,
          profileImageUrl: rssData.image?.url || null,
        },
      };
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        // 无效的URL
        return {
          statusCode: 404,
          message: '无效的RSS或博客地址。',
        };
      } else {
        // 不是RSS，尝试手动解析
        return {
          statusCode: 400,
          message: '非RSS博客地址。',
        };
      }
    }
  }

  async register(params: registerRequestDto) {
    try {
      // S0. 首先尝试解析RSS
      const parsingRSS = await this.parsingRSS({
        url: params.url,
        serviceOn: params.serviceOn,
      });
      let rssData;

      if (parsingRSS && parsingRSS.statusCode == 200) {
        rssData = parsingRSS;
      } else if (parsingRSS && parsingRSS.statusCode == 400) {
        // S1. Brunch
        if (params.url.toLowerCase().includes('brunch.co.kr')) {
          // S1-1. 需要转到顶级路径
          const brunchUniqueId = params.url
            .split('brunch.co.kr/')
            .reverse()[0]
            .split('/')[0];

          // S1-2. 转到顶级路径后再次尝试解析
          const parsedFeedUrl = await this.getRssAddress(
            `https://brunch.co.kr/${brunchUniqueId}`,
          );

          if (parsedFeedUrl.statusCode === 200) {
            // S1-3. 使用解析的RSS地址再次尝试
            return (rssData = await this.register({
              url: parsedFeedUrl.feedUrl,
              loggedUser: params.loggedUser,
              serviceOn: 'brunch',
            }));
          } else {
            throw new Error();
          }
        } else if (params.url.toLowerCase().includes('tistory.com')) {
          // S2. Tistory
          // S2-1. 解析唯一ID
          const tistoryUniqueId = params.url
            .split('.tistory.com')[0]
            .split('/')
            .reverse()[0];

          // S2-2. 转到顶级路径后再次尝试解析
          return (rssData = await this.register({
            url: `https://${tistoryUniqueId}.tistory.com/rss`,
            loggedUser: params.loggedUser,
            serviceOn: 'tistory',
          }));
        } else if (
          params.url.toLowerCase().includes('blog.naver.com') &&
          params.url.toLowerCase().includes('blogid')
        ) {
          // S3. Naver博客（带有查询字符串中的ID）
          // S3-ex. 通过最新的推荐文章、相关文章等访问的情况
          const querys = queryString.parse(params.url);

          if (querys.blogId) {
            const parsedFeedUrl = await this.getRssAddress(
              `https://blog.naver.com/${querys.blogId}`,
            );

            if (parsedFeedUrl.statusCode === 200) {
              // S4-2. 使用解析的RSS地址再次尝试
              return (rssData = await this.register({
                url: parsedFeedUrl.feedUrl,
                loggedUser: params.loggedUser,
                serviceOn: 'naver',
              }));
            } else {
              throw Error();
            }
          }
        } else if (params.url.toLowerCase().includes('m.blog.naver.com')) {
          // S4. Naver移动博客
          // S4-1. RSS解析不可行，从桌面版本解析
          const mobileNaverUniqueId = params.url
            .split('m.blog.naver.com/')
            .reverse()[0]
            .split('/')[0];

          const parsedFeedUrl = await this.getRssAddress(
            `https://blog.naver.com/${mobileNaverUniqueId}`,
          );

          if (parsedFeedUrl.statusCode === 200) {
            // S4-2. 使用解析的RSS地址再次尝试
            return (rssData = await this.register({
              url: parsedFeedUrl.feedUrl,
              loggedUser: params.loggedUser,
              serviceOn: 'naver',
            }));
          } else {
            throw new Error();
          }
        } else if (params.url.toLowerCase().includes('blog.naver.com')) {
          // S5. Naver博客
          // S5-1. 解析唯一ID后从桌面版本解析
          const naverUniqueId = params.url
            .split('blog.naver.com/')
            .reverse()[0]
            .split('/')[0];

          const parsedFeedUrl = await this.getRssAddress(
            `https://blog.naver.com/${naverUniqueId}`,
          );

          if (parsedFeedUrl.statusCode === 200) {
            // S5-2. 使用解析的RSS地址再次尝试
            return (rssData = await this.register({
              url: parsedFeedUrl.feedUrl,
              loggedUser: params.loggedUser,
              serviceOn: 'naver',
            }));
          } else {
            throw new Error();
          }
        } else if (params.url.toLowerCase().includes('medium.com')) {
          // S6. Medium
          // S6-1. 需要转到顶级路径
          const mediumUniqueId = params.url
            .split('medium.com/')
            .reverse()[0]
            .split('/')[0];

          // S6-2. 转到顶级路径后再次尝试解析
          const parsedFeedUrl = await this.getRssAddress(
            `https://medium.com/${mediumUniqueId}`,
          );

          if (parsedFeedUrl.statusCode === 200) {
            // S6-3. 使用解析的RSS地址再次尝试
            return (rssData = await this.register({
              url: parsedFeedUrl.feedUrl,
              loggedUser: params.loggedUser,
              serviceOn: 'medium',
            }));
          } else {
            throw new Error();
          }
        } else {
          // 如果不属于上述情况，则尝试HTML解析
          const parsedFeedUrl = await this.getRssAddress(`${params.url}`);

          if (parsedFeedUrl.statusCode === 200) {
            // S6-3. 使用解析的RSS地址再次尝试
            return (rssData = await this.register({
              url: parsedFeedUrl.feedUrl,
              loggedUser: params.loggedUser,
              serviceOn: null,
            }));
          } else {
            throw new Error();
          }
        }
      }

      if (rssData.statusCode === 200) {
        // 检查重复
        const existFeedUrl = await this.subscribeds
          .createQueryBuilder('subscribed')
          .leftJoinAndSelect('subscribed.followers', 'follower')
          .where('follower.id in (:id) AND subscribed.siteUrl = :siteUrl', {
            id: params.loggedUser.id,
            siteUrl: rssData.data.siteUrl,
          })
          .getMany();

        if (existFeedUrl && existFeedUrl.length > 0) {
          return {
            statusCode: 409,
            message: '已经订阅了该地址。',
            error: '该地址已经被订阅',
          };
        } else {
          // const alreadyRegistUrl = await this.subscribeds.findOne({siteUrl: rssData.data.siteUrl});
          const alreadyRegistUrl = await this.subscribeds
            .createQueryBuilder()
            .where({ siteUrl: rssData.data.siteUrl })
            .getOne();

          if (alreadyRegistUrl) {
            // 如果已存在，则将其添加到订阅列表中。
            await this.subscribeds
              .createQueryBuilder()
              .insert()
              .into(subscribed)
              .values({
                ...rssData.data,
                followers: [params.loggedUser],
              })
              .execute();
          } else {
            // 如果之前不存在，则新建一个。
            await this.subscribeds.save(
              this.subscribeds.create({
                ...rssData.data,
                followers: [params.loggedUser],
              }),
            );
          }
        }

        return rssData;
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: '地址注册失败。',
        error: '无法注册内容的地址',
      };
    }
  }
}

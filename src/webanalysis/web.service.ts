/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { EmailService } from 'src/service';
import { PageTitle, email } from '../config/util.config';
import { FileRepository, UserRepository } from '../repository/user.repository';
import { FileEntity } from 'src/entity/file.entity';
@Injectable()
export class WebService {
  protected title: string;
  protected url: string;
  protected email: string;
  protected UserId: string;
  constructor(
    protected emailService: EmailService,
    protected userRepository: UserRepository,
    protected fileRepository: FileRepository,
  ) { }

  async AnalysisWeb(url: string, UserId) {
    try {
      this.url = url;
      this.UserId = UserId.id;
      const data = await this.WebRequest(url);
      this.WebAnalysis(data);
    } catch (error) {
      console.error(error);
    }
  }

  // 发送请求，并返回一个Promise
  WebRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response && response.statusCode === 200) {
          resolve(body);
        } else {
          reject(
            'Request failed with status code: ' +
            (response && response.statusCode),
          );
        }
      });
    });
  }

  // 解析网页
  WebAnalysis(data) {
    try {
      const $ = cheerio.load(data);
      // 移除 'img' 从要抽取的标签列表
      const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'ol', 'ul'];
      const tagsWithContentAndAttributes = [];
      this.title = $('head title').text();
      function cleanText(text) {
        // 去除多余的空格和换行符
        return text.replace(/\s+/g, ' ').trim();
      }

      function getText(node) {
        if (node.type === 'text') return cleanText(node.data);
        if (node.children) return node.children.map(getText).join(' ');
        return '';
      }

      function getAttributes(node, attributes) {
        const attrs = {};
        attributes.forEach((attr) => {
          if (node.attribs && node.attribs[attr]) {
            attrs[attr] = node.attribs[attr];
          }
        });
        return attrs;
      }

      $('body')
        .find(tags.join(','))
        .each(function () {
          const element = $(this);
          const tagDetails = {
            tag: element.prop('tagName').toLowerCase(),
            content: getText(this),
            attributes: getAttributes(this, ['href', 'title']), // 移除 'src' 和 'alt' 属性
          };
          tagsWithContentAndAttributes.push(tagDetails);
        });

      this.formatElementsForHtml(tagsWithContentAndAttributes);
    } catch (error) {
      console.error('Error processing HTML:', error);
    }
  }
  formatElementsForHtml(elements) {
    try {
      let htmlString =
        '<!DOCTYPE html>\n<html>\n<head>\n<title>Document</title>\n</head>\n<body>\n';

      elements.forEach((tag) => {
        // 打开标签
        htmlString += `<${tag.tag}`;

        // 添加属性
        for (const [key, value] of Object.entries(tag.attributes || {})) {
          htmlString += ` ${key}="${value}"`;
        }

        // 关闭开标签
        htmlString += '>';

        // 添加内容
        if (tag.content) {
          htmlString += tag.content;
        }

        // 闭合标签
        if (!tag.selfClosing) {
          htmlString += `</${tag.tag}>`;
        }
      });

      htmlString += '\n</body>\n</html>'; // 结束 HTML 文档

      this.saveToHtmlFile(htmlString);
    } catch (error) {
      throw new HttpException('文本传输错误', 301);
    }
  }
  //发送邮件
  async saveToHtmlFile(Text) {
    try {
      const fullPath = await this.createFullPath();
      // 写入文件
      fs.writeFileSync(fullPath, Text);
      console.log('文件写入成功');
      if (!this.title) {
        this.title = new Date().getTime().toString();
      }
      this.email = email;
      //调用方法进行存储
      await this.SendFileInfo(
        this.email,
        this.url,
        this.UserId,
        fullPath,
        this.title,
      );

      // 发送邮件
      await this.emailService.example(email, fullPath, `${this.title}.html`);
      console.log(this.title);

      console.log(`邮件发送成功: ${email}`);
    } catch (error) {
      console.error('保存HTML文件或发送邮件时发生错误:', error);
    }
  }
  // 文件下标
  createFullPath(suffix: string = '.html') {
    // 创建文件存储的目录
    const fileDirectory = path.join(process.cwd(), 'src', 'file');
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory, { recursive: true });
    }

    // 生成基于时间戳的文件名
    const timestampFilename = `${new Date().getTime()}${suffix}`;
    const fullPath = path.join(fileDirectory, timestampFilename);
    return fullPath;
  }

  //发送一个文件就进行保存
  /**
   *
   * @param email 要发到哪个email上
   * @param url 要发送的网页地址
   * @param userId 用 id获取当前用户的详细信息
   * @param fullPath 存储文件的路径
   * @param title 文件的title
   */
  async SendFileInfo(email: string, url, userId, filePath, title: string) {
    try {
      // 获取当前用户
      const user = await this.findUser(userId);
      // 对文件进行添加记录
      const result = await this.fileRepository
        .createQueryBuilder()
        .insert()
        .into(FileEntity)
        .values({
          title,
          email,
          url,
          fileUrl: filePath,
          user: user, // 假设您只需要传递用户ID
        })
        .execute();
      return result;
    } catch (error) {
      console.error('发生错误:', error);
    }
  }
  async findUser(userId) {
    const user = await this.userRepository
      .createQueryBuilder()
      .where({ id: userId })
      .getOne();
    if (!user) {
      throw new Error('当前无用户登录');
    }
    return user;
  }
  //查询当前用户发送了什么东西
  async FindUserFile(id) {
    const user = await this.findUser(id);
    const result = await this.fileRepository
      .createQueryBuilder()
      .where({ user })
      .getOne();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any).fileUrl;
    return result;
  }
  //根据文件Id 看看发送什么
  async findFile(id: string) {
    const result = await this.fileRepository
      .createQueryBuilder()
      .where({ id })
      .getOne();
    if (!result) {
      throw new Error('文件不存在');
    }
    return result;
  }
  //对用户发送的东西进行在次重新发送
  async SendTwice(FileId: string) {
    try {
      const res = await this.findFile(FileId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = res as any;
      await this.emailService.example(
        result.email,
        result.fileUrl,
        `${result.title}.html`,
      );
      return `邮件发送成功: ${result.email}`;
    } catch (error) {
      console.error('保存HTML文件或发送邮件时发生错误:', error);
    }
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { EmailService } from 'src/service';
import { PageTitle, email } from '../config/util.config';
@Injectable()
export class WebService {
  constructor(protected emailService: EmailService) { }

  async AnalysisWeb(url: string) {
    try {
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
      const tags = [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'li',
        'ol',
        'ul',
        'img',
      ];
      const tagsWithContentAndAttributes = [];

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
            attributes: getAttributes(this, ['href', 'title', 'src', 'alt']),
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
      let htmlString = '';

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

      this.saveToHtmlFile(htmlString);
    } catch (error) {
      throw new HttpException('文本传输错误', 301);
    }
  }
  async saveToHtmlFile(Text) {
    try {
      const fullPath = await this.createFullPath();
      const str = `<!DOCTYPE html>
      <html>
      <head>
      <title>${PageTitle}</title>
      </head>
      <body>
      ${Text}
      </body>
      </html>
      `;
      // 写入文件
      fs.writeFileSync(fullPath, str);
      console.log('文件写入成功');

      // 发送邮件（此处假设 emailService 是一个配置好的邮件服务实例）
      await this.emailService.example(email, fullPath);
      console.log(`邮件发送成功: ${email}`);
    } catch (error) {
      console.error('保存HTML文件或发送邮件时发生错误:', error);
    }
  }

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
}

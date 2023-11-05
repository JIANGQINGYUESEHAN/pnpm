/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
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
      const elements = [];
      $('h1, h2, h3, h4, h5, h6, img').each((index, elem) => {
        // elem.tagName will give the tag name
        const tagName = elem.tagName.toLowerCase();
        // Determine the depth
        const depth = $(elem).parents().length;
        // Handle image tags differently
        if (tagName === 'img') {
          const src = $(elem).attr('src');
          elements.push({ type: 'img', src, depth });
        } else {
          const text = $(elem).text();
          elements.push({ type: tagName, text, depth });
        }
      });

      // Assuming formatElementsForTxt is a method that takes the elements array
      // and formats them for a txt output.
      this.formatElementsForHtml(elements);
    } catch (error) {
      console.error('Error processing HTML:', error);
    }
  }
  formatElementsForHtml(elements) {
    console.log(elements);
    // const aa = this.createFullPath('.txt');
    // fs.writeFileSync(aa, elements);
    console.log('文件写入成功');

    // let htmlContent = elements
    //   .map((element) => {
    //     if (element.tag === 'img') {
    //       // For image elements, create an img tag with the src attribute
    //       return `<img src="${element.src}" alt="${element.text || ''}">`;
    //     } else {
    //       // For text elements, create an HTML element with the corresponding tag
    //       return `<${element.tag}>${element.text}</${element.tag}>`;
    //     }
    //   })
    //   .join('\n');

    // // Optional: Wrap the content in a root element, like <html>
    // htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n<title>${PageTitle}</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;

    // this.saveToHtmlFile(htmlContent); // Function to save the HTML content to a file
  }
  async saveToHtmlFile(Text) {
    try {
      const fullPath = await this.createFullPath();
      // 写入文件
      fs.writeFileSync(fullPath, Text);
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

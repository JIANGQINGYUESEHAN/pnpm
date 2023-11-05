/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { EmailService } from 'src/service';
import { email } from '../config/util.config';
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
      $('h1, h2, h3, h4, h5, h6, p, span, img').each((i, elem) => {
        const depth = $(elem).parents().length; // Get the depth of the element
        const tagName = elem.tagName.toLowerCase(); // Get the tag name to check if it's an image

        // Handle img tags differently to extract the 'src' attribute
        if (tagName === 'img') {
          const src = $(elem).attr('src'); // Get the src attribute
          if (src) {
            elements.push({ src, depth, type: 'image' }); // Add image details to the array
          }
        } else {
          const text = $(elem).text().trim(); // Get the text and trim it
          if (text) {
            elements.push({ text, depth, type: 'text' }); // Add text details to the array
          }
        }
      });

      // Assuming formatElementsForTxt is a method that takes the elements array
      // and formats them for a txt output.
      this.formatElementsForTxt(elements);
    } catch (error) {
      console.error('Error processing HTML:', error);
    }
  }
  formatElementsForTxt(elements) {
    const Text = elements
      .map((element) => {
        // 根据深度生成缩进，这里使用两个空格进行缩进
        const indentation = ' '.repeat(element.depth - 1);
        return `${indentation}${element.text}`;
      })
      .join('\n');

    this.saveToTxtFile(Text);
  }

  async saveToTxtFile(Text) {
    try {
      //先生成文件然后进行插入

      // 写入文件
      const fileDirectory = path.join(process.cwd(), 'src', 'file');

      const timestampFilename = `${new Date().getTime()}.txt`;
      const fullPath = path.join(fileDirectory, timestampFilename);

      fs.writeFileSync(fullPath, Text);

      console.log('文件写入成功');

      //发送邮件
      const TestPath = path.join(fileDirectory, 'aa.md');
      console.log(TestPath);

      await this.emailService.example(email, TestPath);
    } catch (error) {
      // 如果有错误，会在这里被捕获
      console.error('写入文件时发生错误:', error);
    }
  }
}

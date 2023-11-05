import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async example() {
    // 读取文件内容
    const filePath = path.join(process.cwd(), 'src/file/aaa.txt');
    const result = await fs.promises.readFile(filePath, 'utf-8');

    console.log(result);

    console.log('执行之前');
    this.mailerService
      .sendMail({
        to: '3325246991_YRA3XX@kindle.com', // 收件人邮箱地址
        from: '3325246991@qq.com', // 发件人邮箱地址
        subject: '主题是键盘敲烂，月薪过万！！！', // 邮件主题
        text: '请查看附件', // 邮件正文，纯文本内容
        attachments: [
          {
            filename: 'aaa.txt', // 附件文件名
            content: result, // 文件内容
          },
        ],
      })
      .then(() => {
        console.log('邮件发送成功');
      })
      .catch((e) => {
        console.log('邮件发送失败:', e);
      });
    console.log('执行之后');
  }
}

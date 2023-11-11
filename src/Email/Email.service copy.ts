import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }
  public async example() {
    const result = await fs.readFileSync(
      path.join(process.cwd(), 'src/file/aaa.txt'),
      'utf-8',
    )
    this.mailerService
      .sendMail({
        to: '3325246991_YRA3XX@kindle.com', // list of receivers
        from: '3325246991@qq.com', // sender address
        subject: '主题是键盘敲烂，月薪过万！！！', // Subject line
        attachments: [
          {
            name: 'bbbb.html', // 附件文件名
            content: result, // 文件内容
          },
        ],
      })
      .then(() => {
        console.log('邮件发送成功');
      })
      .catch((e) => {
        console.log(e);
      });
    console.log('执行之后');
  }
}

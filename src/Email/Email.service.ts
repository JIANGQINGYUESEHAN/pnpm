import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Email, verifyUrl } from 'src/config/util.config';
@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }
  //发送文件的
  public async example(email: string, filePath: string, name: string) {
    const data = await this.ReadFile(filePath);
    this.mailerService
      .sendMail({
        to: email, // 收件人邮箱地址
        from: '3325246991@qq.com', // 发件人邮箱地址
        subject: '主题是键盘敲烂，月薪过万！！！', // 邮件主题
        text: '请查看附件', // 邮件正文，纯文本内容
        attachments: [
          {
            filename: name, // 附件文件名
            content: data, // 文件内容
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
  //进行用户验证的
  async sendVerificationEmail(userEmail: string, token: string) {
    const url = verifyUrl(token);

    await this.mailerService.sendMail({
      from: Email().from,
      to: userEmail,
      subject: 'Verify Your Email',
      html: `Please click this link to verify your email: <a href="${url}">${url}</a>`,
    });
  }
  private async ReadFile(url) {
    const data = await fs.readFileSync(url);
    return data;
  }
}

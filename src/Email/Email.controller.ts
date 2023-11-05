import { Controller, Get } from '@nestjs/common';
import { EmailService } from './Email.service';

@Controller('/mail')
export class MailController {
  constructor(private readonly emailService: EmailService) {}
  @Get()
  sendEmail() {
    this.emailService.example();
    return 'ok';
  }
}

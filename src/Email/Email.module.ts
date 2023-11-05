import { Module } from '@nestjs/common';

import { MailController } from './Email.controller';
import { EmailService } from './Email.service';
@Module({
  imports: [],
  exports: [EmailService],
  controllers: [MailController],
  providers: [EmailService],
})
export class MailModule {}

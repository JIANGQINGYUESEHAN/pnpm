import { Module } from '@nestjs/common';
import { SubscribedService } from './subscribed.service';
import { SubscribedController } from './subscribed.controller';

@Module({
  providers: [SubscribedService],
  controllers: [SubscribedController],
})
export class SubscribedModule {}

import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/google.controller';
import { GoogleStrategy } from '../GoogleStrategy';
import { GoogleService } from '../services/google.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [GoogleStrategy, GoogleService],
})
export class GoogleModule {}

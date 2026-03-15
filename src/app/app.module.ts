import { Module } from '@nestjs/common';
import { AppController } from '../app/app.controller.js';
import { AppService } from '../app/app.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

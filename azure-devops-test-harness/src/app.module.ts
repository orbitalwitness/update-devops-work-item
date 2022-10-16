import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AzureDevOpsService } from './azure-devops.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AzureDevOpsService],
})
export class AppModule {}

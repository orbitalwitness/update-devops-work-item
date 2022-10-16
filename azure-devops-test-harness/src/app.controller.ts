import { Controller, Get } from '@nestjs/common';
import { AzureDevOpsService } from './azure-devops.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AzureDevOpsService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import { Controller, Get, Post } from '@nestjs/common'
import { AzureDevOpsService } from './azure-devops.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AzureDevOpsService) {}

  @Get()
  getWorkItem(): object {
    return this.appService.getWorkItem(4577);
  }

  @Post()
  updateWorkItemState(): object {
    return this.appService.updateWorkItemState(4577, 'Ready');
  }
}

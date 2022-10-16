import { Controller, Get, Patch } from '@nestjs/common';
import { AzureDevOpsService } from './azure-devops.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AzureDevOpsService) {}

  @Get('/get-work-item')
  getWorkItem(): object {
    return this.appService.getWorkItem(4577);
  }

  @Patch('/update-work-item-state')
  updateWorkItemState(): object {
    return this.appService.updateWorkItemState(4577, 'Active');
  }
}

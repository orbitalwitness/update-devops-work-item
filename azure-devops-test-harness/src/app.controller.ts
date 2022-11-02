import { Controller, Get, Patch, Query } from '@nestjs/common'
import { AzureDevOpsService } from './azure-devops.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AzureDevOpsService) {}

  @Get('/get-work-item')
  getWorkItem(@Query('id') id: number): object {
    return this.appService.getWorkItem(id);
  }

  @Patch('/update-work-item-state')
  updateWorkItemState(@Query('id') id: number,
                      @Query('state') state: string): object {
    return this.appService.updateWorkItemState(id, state);
  }
}

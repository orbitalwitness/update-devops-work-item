import { Injectable } from '@nestjs/common';

@Injectable()
export class AzureDevOpsService {
  getHello(): string {
    return 'Hello World!';
  }
}

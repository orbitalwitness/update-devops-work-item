import { Injectable } from '@nestjs/common';
import * as azureDevOpsHandler from 'azure-devops-node-api';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { IFetchResponse } from './interfaces/fetch-response.interface';

@Injectable()
export class AzureDevOpsService {
  url = `https://dev.azure.com/${process.env.AZURE_DEVOPS_ORGANISATION}`;

  async getAzureDevOpsClient() {
    const token = process.env.AZURE_DEVOPS_ACCESS_TOKEN;
    const authHandler = azureDevOpsHandler.getPersonalAccessTokenHandler(token);
    const connection = new azureDevOpsHandler.WebApi(this.url, authHandler);
    return await connection.getWorkItemTrackingApi();
  }

  async getWorkItem(workItemId: number): Promise<object> {
    const client: IWorkItemTrackingApi = await this.getAzureDevOpsClient();
    const workItem = await client.getWorkItem(workItemId);

    return {
      workItemDescription: String(workItem.fields['System.Description']),
      currentState: String(workItem.fields['System.State']),
      ...workItem,
    };
  }

  async updateWorkItemState(
    workItemId: number,
    newState: string,
  ): Promise<object> {
    const response: IFetchResponse = {
      code: 500,
      message: 'failed',
      success: false,
      workItem: null,
    };

    const client: IWorkItemTrackingApi = await this.getAzureDevOpsClient();
    const workItem = await client.getWorkItem(workItemId);

    const currentDescription = String(workItem.fields['System.Description']);
    const currentState = workItem.fields['System.State'];

    if (currentState === 'Closed') {
      return {
        ok: false,
        message: 'Work item is closed and cannot be updated',
      };
    }

    const mergeStatus = 'Successfully merged to development!';
    const newDescription = `${currentDescription}<br />${mergeStatus}`;

    try {
      const patchDocument = [];
      patchDocument.push({
        op: 'add',
        path: '/fields/System.State',
        value: newState,
      });
      patchDocument.push({
        op: 'add',
        path: '/fields/System.Description',
        value: newDescription,
      });

      const workItemResult: WorkItem = await client.updateWorkItem(
        [],
        patchDocument,
        workItemId,
      );

      // check to see if the work item is null or undefined
      if (workItemResult === null || workItemResult === undefined) {
        response.message =
          'Error updating work item: Work item result is null or undefined';
        console.log(response.message);
      } else {
        response.code = 200;
        response.message = 'Success';
        response.success = true;
        response.workItem = workItemResult;
        console.log(`Work Item ${workItemId} state is updated to ${newState}`);
      }

      return response;
    } catch (err) {
      response.message = response.message.concat(JSON.stringify(err));
      response.workItem = null;
      response.success = false;

      return response;
    }
  }
}

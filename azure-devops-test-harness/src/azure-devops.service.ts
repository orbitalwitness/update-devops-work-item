import { Injectable } from '@nestjs/common';
import * as azdev from 'azure-devops-node-api';
import * as lim from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

@Injectable()
export class AzureDevOpsService {
  url = `https://dev.azure.com/${process.env.AZURE_DEVOPS_ORGANISATION}`;

  async getApi(serverUrl: string): Promise<azdev.WebApi> {
    return new Promise<azdev.WebApi>(async (resolve, reject) => {
      try {
        const token = process.env.AZURE_DEVOPS_ACCESS_TOKEN;
        const authHandler = azdev.getPersonalAccessTokenHandler(token);
        const option = undefined;

        const connection: azdev.WebApi = new azdev.WebApi(
          serverUrl,
          authHandler,
          option,
        );
        const connData: lim.ConnectionData = await connection.connect();
        console.log(`Hello ${connData.authenticatedUser.providerDisplayName}`);
        resolve(connection);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getWorkItem(workItemId: number): Promise<object> {
    const connection: azdev.WebApi = await this.getApi(this.url);
    const client: IWorkItemTrackingApi =
      await connection.getWorkItemTrackingApi();
    const workItem = await client.getWorkItem(workItemId);

    return {
      message: 'Hello World!',
      project: process.env.AZURE_DEVOPS_PROJECT,
      workItemDescription: String(workItem.fields['System.Description']),
      currentState: String(workItem.fields['System.State']),
      ...workItem,
    };
  }

  async updateWorkItemState(
    workItemId: number,
    state: string,
  ): Promise<object> {
    const connection: azdev.WebApi = await this.getApi(this.url);
    const client: IWorkItemTrackingApi =
      await connection.getWorkItemTrackingApi();
    const workItem = await client.getWorkItem(workItemId);
    const currentState = workItem.fields['System.State'];

    const type = await client.getWorkItemType(
      process.env.AZURE_DEVOPS_PROJECT,
      String(workItem.fields['System.WorkItemType']),
    );
    console.log(JSON.stringify(type));
    if (currentState === 'Closed') {
      return {
        ok: false,
        message: 'Work item is closed and cannot be updated',
      };
    }

    return {
      message: 'Updated',
    };
  }
}

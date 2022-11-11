import { getPersonalAccessTokenHandler, WebApi } from "azure-devops-node-api";
import { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";

import { IConfigService } from "../interfaces/config-service.interface";
import { IGetWorkItemResponse } from "../interfaces/service-response.interface";

export class AzureDevOpsService {
  private readonly configService: IConfigService;
  private readonly url: string;

  constructor(configService: IConfigService) {
    this.configService = configService;
    this.url = `https://dev.azure.com/${this.configService.get<string>(
      "organisation"
    )}`;
  }

  /**
   * Get the specified work item
   * @param workItemId
   * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
   */
  async getWorkItem(workItemId: number): Promise<IGetWorkItemResponse> {
    const response = {
      code: 500,
      message: "failed",
      success: false,
      workItem: null,
    };

    const client = await this.getAzureDevOpsClient();

    try {
      const workItem = await client.getWorkItem(workItemId);
      if (workItem === null || workItem === undefined) {
        response.code = 404;
        response.message = "Error getting work item: Work item is not found";
      } else {
        response.code = 200;
        response.message = "Success";
        response.success = true;
        // @ts-ignore
        response.workItem = workItem;
      }
    } catch (err) {
      response.message = response.message.concat(JSON.stringify(err));
      response.workItem = null;
      response.success = false;
    }

    return response;
  }

  /**
   * Update the state of the specified work item.
   * @param workItemId
   * @param newState
   * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
   */
  async updateWorkItemState(
    workItemId: number,
    newState: string
  ): Promise<IGetWorkItemResponse> {
    const response = {
      code: 500,
      message: "failed",
      success: false,
      workItem: null,
    };

    const client = await this.getAzureDevOpsClient();
    const workItemResponse = await this.getWorkItem(workItemId);
    if (!workItemResponse.success) {
      return workItemResponse;
    }

    const workItem = workItemResponse.workItem;
    const currentDescription = this.getWorkItemDescription(workItem);
    const currentState = this.getWorkItemState(workItem);

    if (currentState === "Closed") {
      response.success = false;
      response.message = "Work item is closed and cannot be updated";
      return response;
    }

    const newDescription = `${currentDescription}<br />${this.configService.get<string>(
      "description"
    )}`;

    try {
      const patchDocument = [];
      patchDocument.push({
        op: "add",
        path: "/fields/System.State",
        value: newState,
      });
      patchDocument.push({
        op: "add",
        path: "/fields/System.Description",
        value: newDescription,
      });

      const workItemResult = await client.updateWorkItem(
        [],
        patchDocument,
        workItemId
      );

      // check to see if the work item is null or undefined
      if (workItemResult === null || workItemResult === undefined) {
        response.message =
          "Error updating work item: Work item result is null or undefined";
        console.log(response.message);
      } else {
        response.code = 200;
        response.message = "Success";
        response.success = true;
        // @ts-ignore
        response.workItem = workItemResult;
        console.log(`Work Item ${workItemId} state is updated to ${newState}`);
      }

      return response;
    } catch (err) {
      response.message = response.message.concat(JSON.stringify(err));
      response.workItem = null;
      response.success = false;
      console.log(`Error updating work item: ${response.message}`);

      return response;
    }
  }

  /**
   * Return the current state of the work item.
   * @param workItem
   * @returns {string}
   */
  getWorkItemState(workItem: any) {
    return String(workItem.fields["System.State"]);
  }

  /**
   * Return the current description of the work item.
   * @param workItem
   * @returns {string}
   */
  getWorkItemDescription(workItem: any) {
    return String(workItem.fields["System.Description"]);
  }

  /**
   * Obtain a reference to the Azure Devops work item tracking API
   * @returns {Promise<IWorkItemTrackingApi>}
   */
  private async getAzureDevOpsClient(): Promise<IWorkItemTrackingApi> {
    const token = this.configService.get<string>("adoToken");
    const authHandler = getPersonalAccessTokenHandler(token);
    const connection = new WebApi(this.url, authHandler);
    return await connection.getWorkItemTrackingApi();
  }
}

import { setFailed } from "@actions/core";
import { context } from "@actions/github";

import { AzureDevOpsService } from "./services/azure-devops-service";
import { ConfigService } from "./services/config-service";
import { GithubService } from "./services/github-service";
import { IGetPrInfoResponse } from "./interfaces/service-response.interface";
import { IConfigService } from "./interfaces/config-service.interface";

const getWorkItemId = async (configService: IConfigService) => {
  console.log("Getting PR info");

  const azureDevOpsService = new AzureDevOpsService(configService);
  const githubService = new GithubService(configService);

  const prInfo: IGetPrInfoResponse = await githubService.getPrInfo();
  if (!prInfo.success) {
    setFailed(prInfo.message);
    return;
  }

  const prBody = prInfo["body"] ?? "";
  const prTitle = prInfo["title"];
  if (!prTitle) {
    setFailed("Unable to retrieve the title of the PR");
    return;
  }

  const workItemIdResponse = githubService.getWorkItemIdFromPr(prBody, prTitle);
  if (!workItemIdResponse || !workItemIdResponse.success) {
    setFailed(workItemIdResponse.message);
    return;
  }

  if (!workItemIdResponse?.workItemId) {
    console.log("Unable to find a PR number.");
    return;
  }

  console.log(`Found work item id from PR: ${workItemIdResponse.workItemId}`);
  const newState = configService.get<string>("newState");

  const updateWorkItemStateResponse =
    await azureDevOpsService.updateWorkItemState(
      Number(workItemIdResponse.workItemId),
      newState
    );
  if (!updateWorkItemStateResponse.success) {
    setFailed(updateWorkItemStateResponse.message);
    return;
  }

  if (!updateWorkItemStateResponse?.message) {
    console.log(
      `Updated work item ${workItemIdResponse.workItemId} to state ${newState}`
    );
  } else {
    console.log(updateWorkItemStateResponse.message);
  }
};

const main = async () => {
  try {
    const configService = new ConfigService(context.payload, process.env);
    await getWorkItemId(configService);
  } catch (error: any) {
    setFailed(error.message);
  }
};

// Call the main function to run the action
main();

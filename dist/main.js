"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const azure_devops_service_1 = require("./services/azure-devops-service");
const config_service_1 = require("./services/config-service");
const github_service_1 = require("./services/github-service");
const getWorkItemId = (configService) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (0, core_1.debug)("Getting PR info");
    const azureDevOpsService = new azure_devops_service_1.AzureDevOpsService(configService);
    const githubService = new github_service_1.GithubService(configService);
    const prInfo = yield githubService.getPrInfo();
    console.log("prInfo: ", JSON.stringify(prInfo));
    if (!prInfo.success) {
        (0, core_1.setFailed)(prInfo.message);
        return;
    }
    const prBody = (_a = prInfo["body"]) !== null && _a !== void 0 ? _a : "";
    const prTitle = prInfo["title"];
    if (!prTitle) {
        (0, core_1.setFailed)("Unable to retrieve the title of the PR");
        return;
    }
    const workItemIdResponse = githubService.getWorkItemIdFromPr(prBody, prTitle);
    if (!workItemIdResponse || !workItemIdResponse.success) {
        (0, core_1.setFailed)(workItemIdResponse.message);
        return;
    }
    (0, core_1.debug)(`Found work item id from PR${workItemIdResponse.workItemId}`);
    const newState = configService.get("newState");
    const updateWorkItemStateResponse = yield azureDevOpsService.updateWorkItemState(Number(workItemIdResponse.workItemId), newState);
    if (!updateWorkItemStateResponse.success) {
        (0, core_1.setFailed)(updateWorkItemStateResponse.message);
        return;
    }
    (0, core_1.debug)(`Updated work item ${workItemIdResponse.workItemId} to state ${newState}`);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configService = new config_service_1.ConfigService(github_1.context.payload, process.env);
        yield getWorkItemId(configService);
    }
    catch (error) {
        (0, core_1.setFailed)(error.message);
    }
});
// Call the main function to run the action
main();

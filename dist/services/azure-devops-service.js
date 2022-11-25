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
exports.AzureDevOpsService = void 0;
const azure_devops_node_api_1 = require("azure-devops-node-api");
class AzureDevOpsService {
    constructor(configService) {
        this.configService = configService;
        this.url = this.configService.get("adoUrl");
    }
    /**
     * Get the specified work item
     * @param workItemId
     * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
     */
    getWorkItem(workItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                code: 500,
                message: "failed",
                success: false,
                workItem: null,
            };
            const client = yield this.getAzureDevOpsClient();
            try {
                const workItem = yield client.getWorkItem(workItemId);
                if (workItem === null || workItem === undefined) {
                    response.code = 404;
                    response.message = "Error getting work item: Work item is not found";
                }
                else {
                    response.code = 200;
                    response.message = "Success";
                    response.success = true;
                    // @ts-ignore
                    response.workItem = workItem;
                }
            }
            catch (err) {
                response.message = response.message.concat(JSON.stringify(err));
                response.workItem = null;
                response.success = false;
            }
            return response;
        });
    }
    /**
     * Update the state of the specified work item.
     * @param workItemId
     * @param newState
     * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
     */
    updateWorkItemState(workItemId, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                code: 500,
                message: "failed",
                success: false,
                workItem: null,
            };
            const client = yield this.getAzureDevOpsClient();
            const workItemResponse = yield this.getWorkItem(workItemId);
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
            const timestamp = new Date().toISOString();
            const newDescription = `${currentDescription}<br />${timestamp.substring(0, timestamp.length - 5).replace('T', ' ')}: ${this.configService.get("description")}`;
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
                const workItemResult = yield client.updateWorkItem([], patchDocument, workItemId);
                // check to see if the work item is null or undefined
                if (workItemResult === null || workItemResult === undefined) {
                    response.message =
                        "Error updating work item: Work item result is null or undefined";
                    console.log(response.message);
                }
                else {
                    response.code = 200;
                    response.message = "Success";
                    response.success = true;
                    // @ts-ignore
                    response.workItem = workItemResult;
                    console.log(`Work Item ${workItemId} state is updated to ${newState}`);
                }
                return response;
            }
            catch (err) {
                response.message = response.message.concat(JSON.stringify(err));
                response.workItem = null;
                response.success = false;
                console.log(`Error updating work item: ${response.message}`);
                return response;
            }
        });
    }
    /**
     * Return the current state of the work item.
     * @param workItem
     * @returns {string}
     */
    getWorkItemState(workItem) {
        return String(workItem.fields["System.State"]);
    }
    /**
     * Return the current description of the work item.
     * @param workItem
     * @returns {string}
     */
    getWorkItemDescription(workItem) {
        return String(workItem.fields["System.Description"]);
    }
    /**
     * Obtain a reference to the Azure Devops work item tracking API
     * @returns {Promise<IWorkItemTrackingApi>}
     */
    getAzureDevOpsClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.configService.get("adoToken");
            const authHandler = (0, azure_devops_node_api_1.getPersonalAccessTokenHandler)(token);
            const connection = new azure_devops_node_api_1.WebApi(this.url, authHandler);
            return yield connection.getWorkItemTrackingApi();
        });
    }
}
exports.AzureDevOpsService = AzureDevOpsService;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const common_1 = require("@nestjs/common");
const azureDevOpsHandler = __importStar(require("azure-devops-node-api"));
let AzureDevOpsService = class AzureDevOpsService {
    constructor(configService) {
        this.configService = configService;
        this.url = `https://dev.azure.com/${this.configService.get('ORGANISATION')}`;
    }
    getAzureDevOpsClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.configService.get('ADO_TOKEN');
            const authHandler = azureDevOpsHandler.getPersonalAccessTokenHandler(token);
            const connection = new azureDevOpsHandler.WebApi(this.url, authHandler);
            return yield connection.getWorkItemTrackingApi();
        });
    }
    getWorkItem(workItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getAzureDevOpsClient();
            const workItem = yield client.getWorkItem(workItemId);
            return Object.assign({ workItemDescription: String(workItem.fields['System.Description']), currentState: String(workItem.fields['System.State']) }, workItem);
        });
    }
    updateWorkItemState(workItemId, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                code: 500,
                message: 'failed',
                success: false,
                workItem: null,
            };
            const client = yield this.getAzureDevOpsClient();
            const workItem = yield client.getWorkItem(workItemId);
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
                const workItemResult = yield client.updateWorkItem([], patchDocument, workItemId);
                // check to see if the work item is null or undefined
                if (workItemResult === null || workItemResult === undefined) {
                    response.message =
                        'Error updating work item: Work item result is null or undefined';
                    console.log(response.message);
                }
                else {
                    response.code = 200;
                    response.message = 'Success';
                    response.success = true;
                    response.workItem = workItemResult;
                    console.log(`Work Item ${workItemId} state is updated to ${newState}`);
                }
                return response;
            }
            catch (err) {
                response.message = response.message.concat(JSON.stringify(err));
                response.workItem = null;
                response.success = false;
                return response;
            }
        });
    }
};
AzureDevOpsService = __decorate([
    (0, common_1.Injectable)()
], AzureDevOpsService);
exports.AzureDevOpsService = AzureDevOpsService;

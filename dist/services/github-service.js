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
exports.GithubService = void 0;
const github_1 = require("@actions/github");
class GithubService {
    constructor(configService) {
        this.configService = configService;
    }
    /**
     * Uses the Github API to return the body, title and status of the pull request
     * @returns {Promise<{code: number, success: boolean, message: string, body: null, title: null, status: null}>}
     */
    getPrInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                code: 500,
                message: "failed",
                success: false,
                body: null,
                status: null,
                title: null,
            };
            try {
                const data = yield this.getPrData();
                if (data) {
                    response.code = 200;
                    response.message = "success";
                    response.success = true;
                    response.body = data.body;
                    response.status = data.status;
                    response.title = data.title;
                }
                else {
                    response.message = `Unable to retrieve the pull request (${this.configService.get("pullNumber")})`;
                }
            }
            catch (err) {
                response.message = response.message.concat(JSON.stringify(err));
            }
            return response;
        });
    }
    /**
     * Return the work item Id that is included in the pull request body or title.
     * @param fullPrBody
     * @param fullPrTitle
     * @returns {{code: number, success: boolean, workItemId: null, message: string}}
     */
    getWorkItemIdFromPr(fullPrBody, fullPrTitle) {
        const response = {
            code: 500,
            message: "failed",
            success: false,
            workItemId: null,
        };
        try {
            console.log(`body: "${fullPrBody}"`);
            console.log(`title: "${fullPrTitle}"`);
            let foundMatches = fullPrBody.match(/AB#[(0-9)]*/g);
            console.log("matches from body: ", foundMatches !== null ? foundMatches.toString() : "no matches");
            if (foundMatches === null || foundMatches.length === 0) {
                foundMatches = fullPrTitle.match(/AB#[(0-9)]*/g);
                console.log("matches from title: ", foundMatches !== null ? foundMatches.toString() : "no matches");
            }
            if (foundMatches && foundMatches.length > 0) {
                const fullWorkItemId = foundMatches[0];
                if (fullWorkItemId) {
                    response.code = 200;
                    response.message = "success";
                    response.success = true;
                    // @ts-ignore
                    response.workItemId = fullWorkItemId.match(/[0-9]*/g)[3];
                }
                else {
                    response.message =
                        "Unable to find a work item in the title or body of the pull request";
                }
            }
            else {
                response.message =
                    "Unable to find a work item in the title or body of the pull request";
            }
        }
        catch (err) {
            response.message = response.message.concat(JSON.stringify(err));
        }
        return response;
    }
    /**
     * Is the pull request currently open
     * @returns {Promise<boolean>}
     */
    isPrOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequestStatus = yield this.getPrState();
            return pullRequestStatus === "open";
        });
    }
    /**
     * Is the pull request currently merged
     * @returns {Promise<boolean>}
     */
    isPrMerged() {
        return __awaiter(this, void 0, void 0, function* () {
            const mergeStatus = yield this.getMergeState();
            return mergeStatus === "204";
        });
    }
    /**
     * Is the pull request currently closed
     * @returns {Promise<boolean>}
     */
    isPrClosed() {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequestStatus = yield this.getPrState();
            return pullRequestStatus === "closed";
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.configService.get("ghToken");
            return (0, github_1.getOctokit)(token);
        });
    }
    getPrData() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            const { data } = yield connection.rest.pulls.get({
                owner: this.configService.get("ghRepoOwner"),
                repo: this.configService.get("ghRepo"),
                pull_number: this.configService.get("pullNumber"),
            });
            console.log("PR data ", JSON.stringify(data));
            return data;
        });
    }
    /**
     * Get the state of the specified pull request.
     * @returns {Promise<String>}
     */
    getPrState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.configService.get("pullNumber") == null) {
                throw Error("No PR number provided");
            }
            const data = yield this.getPrData();
            return data.state;
        });
    }
    /**
     * Get the merge status of the specified pull request.
     * @returns {Promise<String>}
     */
    getMergeState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.configService.get("pullNumber") == null) {
                throw Error("No PR number provided");
            }
            const data = yield this.getPrData();
            return data.status;
        });
    }
}
exports.GithubService = GithubService;

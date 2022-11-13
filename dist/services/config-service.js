"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const core_1 = require("@actions/core");
class ConfigService {
    constructor(githubContext) {
        var _a, _b, _c, _d;
        const organisation = (0, core_1.getInput)("organisation", { required: true });
        const url = `https://dev.azure.com/${organisation}`;
        this.env = {
            action: githubContext.action !== undefined ? githubContext.action : "",
            adoToken: (0, core_1.getInput)("ado_token", { required: true }),
            ghToken: (0, core_1.getInput)("gh_token", { required: true }),
            organisation,
            orgUrl: url,
            ghRepoOwner: (_a = (0, core_1.getInput)("gh_repo_owner", { required: false })) !== null && _a !== void 0 ? _a : "",
            ghRepo: (_b = (0, core_1.getInput)("gh_repo", { required: false })) !== null && _b !== void 0 ? _b : "",
            pullNumber: Number((0, core_1.getInput)("pull_number", { required: true })),
            newState: (0, core_1.getInput)("new_state", { required: true }),
            description: (_c = (0, core_1.getInput)("description")) !== null && _c !== void 0 ? _c : "",
            closedState: (_d = (0, core_1.getInput)("closed_state")) !== null && _d !== void 0 ? _d : "Closed",
        };
    }
    get(name) {
        return this.env[name];
    }
}
exports.ConfigService = ConfigService;

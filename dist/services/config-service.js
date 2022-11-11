"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
class ConfigService {
    constructor(githubContext) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const organisation = (_a = process.env["organisation"]) !== null && _a !== void 0 ? _a : "";
        const url = `https://dev.azure.com/${organisation}`;
        this.env = {
            action: githubContext.action !== undefined ? githubContext.action : "",
            adoToken: (_b = process.env["ado_token"]) !== null && _b !== void 0 ? _b : "",
            ghToken: (_c = process.env["gh_token"]) !== null && _c !== void 0 ? _c : "",
            organisation,
            orgUrl: url,
            ghRepoOwner: (_d = process.env["gh_repo_owner"]) !== null && _d !== void 0 ? _d : "",
            ghRepo: (_e = process.env["gh_repo"]) !== null && _e !== void 0 ? _e : "",
            pullNumber: Number((_f = process.env["pull_number"]) !== null && _f !== void 0 ? _f : ""),
            newState: (_g = process.env["new_state"]) !== null && _g !== void 0 ? _g : "",
            description: (_h = process.env["description"]) !== null && _h !== void 0 ? _h : "",
            closedState: (_j = process.env["closed_state"]) !== null && _j !== void 0 ? _j : "Closed",
        };
    }
    get(name) {
        return this.env[name];
    }
}
exports.ConfigService = ConfigService;

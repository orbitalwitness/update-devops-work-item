"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
class ConfigService {
    constructor(githubContext, env) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (!env.ado_token)
            console.log("Missing ado_token value");
        if (!env.gh_token)
            console.log("Missing gh_token value");
        if (!env.ado_organisation)
            console.log("Missing organisation value");
        const adoOrganisation = (_a = env["ado_organisation"]) !== null && _a !== void 0 ? _a : "";
        const adoUrl = `https://dev.azure.com/${adoOrganisation}`;
        console.log('ADO url: ', adoUrl);
        this.env = {
            action: githubContext.action !== undefined ? githubContext.action : "",
            adoToken: (_b = env["ado_token"]) !== null && _b !== void 0 ? _b : "",
            ghToken: (_c = env["gh_token"]) !== null && _c !== void 0 ? _c : "",
            adoOrganisation,
            adoUrl,
            ghRepoOwner: (_d = env["gh_repo_owner"]) !== null && _d !== void 0 ? _d : "",
            ghRepo: (_e = env["gh_repo"]) !== null && _e !== void 0 ? _e : "",
            pullNumber: Number((_f = env["pull_number"]) !== null && _f !== void 0 ? _f : 0),
            newState: (_g = env["new_state"]) !== null && _g !== void 0 ? _g : "",
            description: (_h = env["description"]) !== null && _h !== void 0 ? _h : "",
            closedState: (_j = env["closed_state"]) !== null && _j !== void 0 ? _j : "Closed",
        };
    }
    get(name) {
        return this.env[name];
    }
}
exports.ConfigService = ConfigService;

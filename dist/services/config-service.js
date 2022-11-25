"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
class ConfigService {
    constructor(githubContext, env) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!env.ado_token)
            console.log('Missing ado_token value');
        if (!env.gh_token)
            console.log('Missing gh_token value');
        if (!env.organisation)
            console.log('Missing organisation value');
        if (!env.project)
            console.log('Missing project value');
        const organisation = (_a = env.organisation) !== null && _a !== void 0 ? _a : "";
        const url = `https://dev.azure.com/${organisation}`;
        this.env = {
            action: githubContext.action !== undefined ? githubContext.action : "",
            adoToken: (_b = env.ado_token) !== null && _b !== void 0 ? _b : "",
            ghToken: (_c = env.gh_token) !== null && _c !== void 0 ? _c : "",
            organisation,
            orgUrl: url,
            project: (_d = env.project) !== null && _d !== void 0 ? _d : "",
            ghRepoOwner: (_e = env.gh_repo_owner) !== null && _e !== void 0 ? _e : "",
            ghRepo: (_f = env.gh_repo) !== null && _f !== void 0 ? _f : "",
            pullNumber: Number((_g = env.pull_number) !== null && _g !== void 0 ? _g : 0),
            newState: (_h = env.new_state) !== null && _h !== void 0 ? _h : "",
            description: (_j = env.description) !== null && _j !== void 0 ? _j : "",
            closedState: (_k = env.closed_state) !== null && _k !== void 0 ? _k : "Closed",
        };
    }
    get(name) {
        return this.env[name];
    }
}
exports.ConfigService = ConfigService;

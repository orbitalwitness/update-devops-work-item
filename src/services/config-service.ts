import { IConfigService } from "../interfaces/config-service.interface";
import { IEnvironment } from "../interfaces/environment.interface";

export class ConfigService implements IConfigService {
  private readonly env: IEnvironment;

  constructor(githubContext: any, env: any) {
    if (!env.ado_token) console.log("Missing ado_token value");
    if (!env.gh_token) console.log("Missing gh_token value");
    if (!env.ado_organisation) console.log("Missing organisation value");

    const adoOrganisation = env["ado_organisation"] ?? "";
    const adoUrl = `https://dev.azure.com/${adoOrganisation}`;
    console.log("ADO url: ", adoUrl);

    this.env = {
      action: githubContext.action !== undefined ? githubContext.action : "",
      adoToken: env["ado_token"] ?? "",
      ghToken: env["gh_token"] ?? "",
      adoOrganisation,
      adoUrl,
      ghRepoOwner: env["gh_repo_owner"] ?? "",
      ghRepo: env["gh_repo"] ?? "",
      pullNumber: Number(env["pull_number"] ?? 0),
      newState: env["new_state"] ?? "",
      description: env["description"] ?? "",
      closedState: env["closed_state"] ?? "Closed",
    };
  }

  public get<T>(name: keyof IEnvironment): T {
    return <T>(<unknown>this.env[name]);
  }
}

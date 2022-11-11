import { IConfigService } from "../interfaces/config-service.interface";
import { IEnvironment } from "../interfaces/environment.interface";

export class ConfigService implements IConfigService {
  private readonly env: IEnvironment;

  constructor(githubContext: any) {
    const organisation = process.env["organisation"] ?? "";
    const url = `https://dev.azure.com/${organisation}`;

    this.env = {
      action: githubContext.action !== undefined ? githubContext.action : "",
      adoToken: process.env["ado_token"] ?? "",
      ghToken: process.env["gh_token"] ?? "",
      organisation,
      orgUrl: url,
      ghRepoOwner: process.env["gh_repo_owner"] ?? "",
      ghRepo: process.env["gh_repo"] ?? "",
      pullNumber: Number(process.env["pull_number"] ?? ""),
      newState: process.env["new_state"] ?? "",
      description: process.env["description"] ?? "",
      closedState: process.env["closed_state"] ?? "Closed",
    };
  }

  public get<T>(name: keyof IEnvironment): T {
    return <T>(<unknown>this.env[name]);
  }
}

import { getInput } from "@actions/core";
import { IConfigService } from "../interfaces/config-service.interface";
import { IEnvironment } from "../interfaces/environment.interface";

export class ConfigService implements IConfigService {
  private readonly env: IEnvironment;

  constructor(githubContext: any) {
    const organisation = getInput("organisation", { required: true });
    const url = `https://dev.azure.com/${organisation}`;

    this.env = {
      action: githubContext.action !== undefined ? githubContext.action : "",
      adoToken: getInput("ado_token", { required: true }),
      ghToken: getInput("gh_token", { required: true }),
      organisation,
      orgUrl: url,
      ghRepoOwner: getInput("gh_repo_owner", { required: false }) ?? "",
      ghRepo: getInput("gh_repo", { required: false }) ?? "",
      pullNumber: Number(getInput("pull_number", { required: true })),
      newState: getInput("new_state", { required: true }),
      description: getInput("description") ?? "",
      closedState: getInput("closed_state") ?? "Closed",
    };
  }

  public get<T>(name: keyof IEnvironment): T {
    return <T>(<unknown>this.env[name]);
  }
}

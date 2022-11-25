import { getOctokit } from "@actions/github";
import {
  IGetPrInfoResponse,
  IGetWorkItemIdFromPrResponse,
} from "../interfaces/service-response.interface";
import { IConfigService } from "../interfaces/config-service.interface";

export class GithubService {
  private readonly configService: IConfigService;

  constructor(configService: IConfigService) {
    this.configService = configService;
  }

  /**
   * Uses the Github API to return the body, title and status of the pull request
   * @returns {Promise<{code: number, success: boolean, message: string, body: null, title: null, status: null}>}
   */
  public async getPrInfo(): Promise<IGetPrInfoResponse> {
    const response: IGetPrInfoResponse = {
      code: 500,
      message: "failed",
      success: false,
      body: null,
      status: null,
      title: null,
    };

    try {
      const data = await this.getPrData();

      if (data) {
        response.code = 200;
        response.message = "success";
        response.success = true;
        response.body = data.body;
        response.status = data.status;
        response.title = data.title;
      } else {
        response.message = `Unable to retrieve the pull request (${this.configService.get<string>(
          "pullNumber"
        )})`;
      }
    } catch (err) {
      response.message = response.message.concat(JSON.stringify(err));
    }

    return response;
  }

  /**
   * Return the work item Id that is included in the pull request body or title.
   * @param fullPrBody
   * @param fullPrTitle
   * @returns {{code: number, success: boolean, workItemId: null, message: string}}
   */
  public getWorkItemIdFromPr(
    fullPrBody: string,
    fullPrTitle: string
  ): IGetWorkItemIdFromPrResponse {
    const response = {
      code: 500,
      message: "failed",
      success: false,
      workItemId: null,
    };

    try {
      let foundMatches = fullPrBody.match(/AB#[(0-9)]*/g);
      if (foundMatches && foundMatches.length > 0) {
        foundMatches = fullPrTitle.match(/AB#[(0-9)]*/g);
      }

      if (foundMatches && foundMatches.length > 0) {
        const fullWorkItemId = foundMatches[0];

        if (fullWorkItemId) {
          response.code = 200;
          response.message = "success";
          response.success = true;
          // @ts-ignore
          response.workItemId = fullWorkItemId.match(/[0-9]*/g)[3];
        } else {
          response.message =
            "Unable to find a work item in the title or body of the pull request";
        }
      } else {
        response.message =
          "Unable to find a work item in the title or body of the pull request";
      }
    } catch (err) {
      response.message = response.message.concat(JSON.stringify(err));
    }

    return response;
  }

  /**
   * Is the pull request currently open
   * @returns {Promise<boolean>}
   */
  public async isPrOpen(): Promise<boolean> {
    const pullRequestStatus = await this.getPrState();
    return pullRequestStatus === "open";
  }

  /**
   * Is the pull request currently merged
   * @returns {Promise<boolean>}
   */
  public async isPrMerged(): Promise<boolean> {
    const mergeStatus = await this.getMergeState();
    return mergeStatus === "204";
  }

  /**
   * Is the pull request currently closed
   * @returns {Promise<boolean>}
   */
  public async isPrClosed(): Promise<boolean> {
    const pullRequestStatus = await this.getPrState();
    return pullRequestStatus === "closed";
  }

  private async getConnection(): Promise<any> {
    const token = this.configService.get<string>("ghToken");
    return getOctokit(token);
  }

  private async getPrData(): Promise<any> {
    const connection = await this.getConnection();
    const { data } = await connection.rest.pulls.get({
      owner: this.configService.get<string>("ghRepoOwner"),
      repo: this.configService.get<string>("ghRepo"),
      pull_number: this.configService.get<string>("pullNumber"),
    });
    console.log("PR data ", JSON.stringify(data));

    return data;
  }

  /**
   * Get the state of the specified pull request.
   * @returns {Promise<String>}
   */
  private async getPrState(): Promise<string> {
    if (this.configService.get<string>("pullNumber") == null) {
      throw Error("No PR number provided");
    }

    const data = await this.getPrData();

    return data.state;
  }

  /**
   * Get the merge status of the specified pull request.
   * @returns {Promise<String>}
   */
  private async getMergeState(): Promise<string> {
    if (this.configService.get<string>("pullNumber") == null) {
      throw Error("No PR number provided");
    }

    const data = await this.getPrData();

    return data.status;
  }
}

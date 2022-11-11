export interface IEnvironment {
  action: string;
  adoToken: string;
  ghToken: string;
  organisation: string;
  orgUrl: string;
  ghRepoOwner: string;
  ghRepo: string;
  pullNumber: number;
  newState: string;
  description?: string;
  closedState?: string;
}

export interface IEnvironment {
  action: string;
  adoToken: string;
  ghToken: string;
  adoOrganisation: string;
  adoUrl: string;
  ghRepoOwner: string;
  ghRepo: string;
  pullNumber: number;
  newState: string;
  description?: string;
  closedState?: string;
}

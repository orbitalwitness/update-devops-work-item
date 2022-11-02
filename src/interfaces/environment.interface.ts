export interface IEnvironment {
    action: string,
    ado_token: string,
    gh_token: string,
    organisation: string,
    org_url: string,
    gh_repo_owner: string,
    gh_repo: string,
    pull_number: number,
    new_state: string,
    description?: string,
}

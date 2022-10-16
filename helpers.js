const fetch = require("node-fetch")
const core = require('@actions/core')

global.Headers = fetch.Headers

/**
 * Setup and return the Github API headers with the token to make requests.
 * @param env
 * @returns {Headers}
 */
export const getRequestHeaders = (env) => {
    let h = new Headers()
    let auth = 'token ' + env.gh_token
    h.append('Authorization', auth)
    return h
}

/**
 * Create an object with the required values for use in the action.
 * @param payload
 * @returns {{action: (*|string), env: {org_url: (string|string), pull_number: (*|string), gh_repo_owner: (*|string),
 *     organisation: (string|string), gh_repo: (*|string), new_state: (*|string), ado_token: (*|string), closed_state:
 *     (string|string), gh_token: (*|string)}}}
 */
export const getValuesFromPayload = (payload) => {
    const env = {
        action: payload.action !== undefined ? payload.action : '',
        env: {
            organisation: core.getInput('ado_organisation'),
            org_url: `https://dev.azure.com/${ core.getInput('ado_organisation') }`,
            ado_token: core.getInput('ado_token'),
            gh_repo_owner: core.getInput('gh_repo_owner'),
            gh_repo: core.getInput('gh_repo'),
            pull_number: core.getInput('pull_number'),
            gh_token: core.getInput('gh_token'),
            new_state: core.getInput('new_state'),
            description: core.getInput('description') ?? '',
            closed_state: core.getInput('closed_state') ?? 'Closed'
        }
    }

    core.debug(`env: ${JSON.stringify(env)}`);

    return env
}

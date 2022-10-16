import fetch from 'node-fetch'

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
    return {
        action: payload.action !== undefined ? payload.action : '',
        env: {
            organisation: process.env.ado_organisation !== undefined ? process.env.ado_organisation : '',
            org_url: process.env.ado_organisation !== undefined ? 'https://dev.azure.com/' + process.env.ado_organisation : '',
            ado_token: process.env.ado_token !== undefined ? process.env.ado_token : '',
            gh_repo_owner: process.env.gh_repo_owner !== undefined ? process.env.gh_repo_owner : '',
            gh_repo: process.env.gh_repo !== undefined ? process.env.gh_repo : '',
            pull_number: process.env.pull_number !== undefined ? process.env.pull_number : '',
            closed_state: process.env.closed_state !== undefined ? process.env.closedstate : 'Closed',
            gh_token: process.env.gh_token !== undefined ? process.env.gh_token : '',
            new_state: process.env.new_state !== undefined ? process.env.new_state : '',
            description: process.env.description !== undefined ? process.env.description : ''
        }
    }
}

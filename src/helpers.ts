import { debug, getInput } from '@actions/core'
import { IEnvironment } from './interfaces/environment.interface'

/**
 * Create an object with the required values for use in the action.
 * @param payload
 * @returns {{action: (*|string), env: {org_url: (string|string), pull_number: (*|string), gh_repo_owner: (*|string),
 *     organisation: (string|string), gh_repo: (*|string), new_state: (*|string), ado_token: (*|string), closed_state:
 *     (string|string), gh_token: (*|string)}}}
 */
export const getValuesFromPayload = (payload: any): IEnvironment => {
    const organisation = getInput('organisation', { required: true })
    const url = `https://dev.azure.com/${ organisation }`

    const env = {
        action: payload.action !== undefined ? payload.action : '',
        ado_token: getInput('ado_token', { required: true }),
        gh_token: getInput('gh_token', { required: true }),
        organisation,
        org_url: url,
        gh_repo_owner: getInput('gh_repo_owner', { required: false }) ?? '',
        gh_repo: getInput('gh_repo', { required: false }) ?? '',
        pull_number: Number(getInput('pull_number', { required: true })),
        new_state: getInput('new_state', { required: true }),
        description: getInput('description') ?? '',
        closed_state: getInput('closed_state') ?? 'Closed'
    }

    debug(`env: ${ JSON.stringify(env) }`)

    return env
}

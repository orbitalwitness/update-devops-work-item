import { getOctokit } from '@actions/github'
import { IEnvironment } from '../interfaces/environment.interface'
import { IGetPrInfoResponse, IGetWorkItemIdFromPrResponse } from '../interfaces/github-service-responses.interface'

export const getConnection = async (token: string): Promise<any> => {
    return getOctokit(token)
}
/**
 * Uses the Github API to return the body, title and status of the pull request
 * @param env
 * @returns {Promise<{code: number, success: boolean, message: string, body: null, title: null, status: null}>}
 */
export const getPrInfo = async (env: IEnvironment): Promise<IGetPrInfoResponse> => {
    const response: IGetPrInfoResponse = {
        code: 500,
        message: 'failed',
        success: false,
        body: null,
        status: null,
        title: null,
    }

    try {
        const data = await getPrData(env)

        if (data) {
            response.code = 200
            response.message = 'success'
            response.success = true
            response.body = data.body
            response.status = data.status
            response.title = data.title
        } else {
            response.message = `Unable to retrieve the pull request (${ env.pull_number })`
        }
    } catch (err) {
        response.message = response.message.concat(JSON.stringify(err))
    }

    return response
}

/**
 * Return the work item Id that is included in the pull request body or title.
 * @param fullPrBody
 * @param fullPrTitle
 * @returns {{code: number, success: boolean, workItemId: null, message: string}}
 */
export const getWorkItemIdFromPr = (fullPrBody: string, fullPrTitle: string): IGetWorkItemIdFromPrResponse => {
    const response = {
        code: 500,
        message: 'failed',
        success: false,
        workItemId: null,
    }

    try {
        let foundMatches = fullPrBody.match(/AB#[(0-9)]*/g)
        if (foundMatches && foundMatches.length > 0) {
            foundMatches = fullPrTitle.match(/AB#[(0-9)]*/g)
        }

        if (foundMatches && foundMatches.length > 0) {
            const fullWorkItemId = foundMatches[0]

            if(fullWorkItemId) {
                response.code = 200
                response.message = 'success'
                response.success = true
                // @ts-ignore
                response.workItemId = fullWorkItemId.match(/[0-9]*/g)[3]
            } else {
                response.message = 'Unable to find a work item in the title or body of the pull request'
            }
        } else {
            response.message = 'Unable to find a work item in the title or body of the pull request'
        }
    } catch (err) {
        response.message = response.message.concat(JSON.stringify(err))
    }

    return response
}

/**
 * Is the pull request currently open
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrOpen = async (env: IEnvironment): Promise<Boolean> => {
    const pullRequestStatus = await getPrState(env)
    return pullRequestStatus === 'open'
}

/**
 * Is the pull request currently merged
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrMerged = async (env: IEnvironment): Promise<Boolean> => {
    const mergeStatus = await getMergeState(env)
    return mergeStatus === '204'
}

/**
 * Is the pull request currently closed
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrClosed = async (env: IEnvironment): Promise<Boolean> => {
    const pullRequestStatus = await getPrState(env)
    return pullRequestStatus === 'closed'
}

// private functions
const getPrData = async (env: IEnvironment): Promise<any> => {
    const connection = await getConnection(env.gh_token)
    const { data } = await connection.rest.pulls.get({
        owner: env.gh_repo_owner,
        repo: env.gh_repo,
        pull_number: env.pull_number,
    })

    return data
}
/**
 * Get the state of the specified pull request.
 * @param env
 * @returns {Promise<String>}
 */
const getPrState = async (env: IEnvironment): Promise<String> => {
    if (env.pull_number == null) {
        throw Error('No PR number provided')
    }

    const data = await getPrData(env)

    return data.state
}

/**
 * Get the merge status of the specified pull request.
 * @param env
 * @returns {Promise<String>}
 */
const getMergeState = async (env: IEnvironment): Promise<String> => {
    if (env.pull_number == null) {
        throw Error('No PR number provided')
    }

    const data = await getPrData(env)

    return data.status
}

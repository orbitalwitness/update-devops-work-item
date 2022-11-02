const github = require('@actions/github')

export const getConnection = async (token) => {
    return github.getOctokit(token)
}
/**
 * Uses the Github API to return the body, title and status of the pull request
 * @param env
 * @returns {Promise<{code: number, success: boolean, message: string, body: null, title: null, status: null}>}
 */
export const getPrInfo = async (env) => {
    const response = {
        code: 500,
        message: 'failed',
        success: false,
        body: null,
        status: null,
        title: null,
    }

    try {
        const data = await getPrData(env)

        if (result) {
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
        response.workItem = null
        response.success = false
    }

    return response
}

/**
 * Return the work item Id that is included in the pull request body or title.
 * @param fullPrBody
 * @param fullPrTitle
 * @returns {{code: number, success: boolean, workItemId: null, message: string}}
 */
export const getWorkItemIdFromPr = (fullPrBody, fullPrTitle) => {
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

            response.code = 200
            response.message = 'success'
            response.success = true
            response.workItemId = fullWorkItemId.match(/[0-9]*/g)[3]
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
export const isPrOpen = async (env) => {
    const pullRequestStatus = await getPrState(env)
    return pullRequestStatus === 'open'
}

/**
 * Is the pull request currently merged
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrMerged = async (env) => {
    const mergeStatus = await getMergeState(env)
    return mergeStatus === '204'
}

/**
 * Is the pull request currently closed
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrClosed = async (env) => {
    const pullRequestStatus = await getPrState(env)
    return pullRequestStatus === 'closed'
}

// private functions
const getPrData = async (env) => {
    const connection = getConnection(env.gh_token)
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
const getPrState = async (env) => {
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
const getMergeState = async (env) => {
    if (env.pull_number == null) {
        throw Error('No PR number provided')
    }

    const data = await getPrData(env)

    return data.status
}

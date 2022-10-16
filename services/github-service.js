const fetch = require("node-fetch")
const helpers = require('../helpers')

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
        const requestUrl = 'https://api.github.com/repos/' + env.gh_repo_owner + '/' + env.gh_repo + '/pulls/' + env.pull_number
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: helpers.getRequestHeaders(env)
        })
        const result = await response.json()

        if (result) {
            response.code = 200
            response.message = 'success'
            response.success = true
            response.body = result.body
            response.status = result.status
            response.title = result.title
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
        if(foundMatches && foundMatches.length > 0) {
            foundMatches = fullPrTitle.match(/AB#[(0-9)]*/g)
        }

        if(foundMatches && foundMatches.length > 0) {
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
 * @param pullRequestNumber
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrOpen = async (pullRequestNumber, env) => {
    const pullRequestStatus = await getPrState(pullRequestNumber, env)
    return pullRequestStatus === "open";
}

/**
 * Is the pull request currently merged
 * @param pullRequestNumber
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrMerged = async (pullRequestNumber, env) => {
    const mergeStatus = await getMergeState(pullRequestNumber, env)
    return mergeStatus === 204;
}

/**
 * Is the pull request currently closed
 * @param pullRequestNumber
 * @param env
 * @returns {Promise<boolean>}
 */
export const isPrClosed = async (pullRequestNumber, env) => {
    const pullRequestStatus = await getPrState(pullRequestNumber, env);
    return pullRequestStatus === "closed";
}

// private functions
/**
 * Get the state of the specified pull request.
 * @param pullRequestNumber
 * @param env
 * @returns {Promise<String>}
 */
export const getPrState = async (pullRequestNumber, env) =>{
    if (pullRequestNumber == null) {
        pullRequestNumber = env.pull_number;
    }

    const requestUrl = `https://api.github.com/repos/${ env.gh_repo_owner }/${ env.gh_repo }/pulls/${ pullRequestNumber }`;
    const fetchResponse = await fetch (requestUrl, {
        method: 'GET',
        headers: helpers.getRequestHeaders(env)
    });
    const jsonResponse = await fetchResponse.json();

    return jsonResponse.state;
}

/**
 * Get the merge status of the specified pull request.
 * @param pullRequestNumber
 * @param env
 * @returns {Promise<String>}
 */
async function getMergeState(pullRequestNumber, env) {
    if (pullRequestNumber == null) {
        pullRequestNumber = env.pull_number;
    }

    const requestUrl = `https://api.github.com/repos/${ env.gh_repo_owner }/${ env.gh_repo }/pulls/${ pullRequestNumber }/merge`;
    const fetchResponse = await fetch(requestUrl, {
        method: 'GET',
        headers: helpers.getRequestHeaders(env)
    })

    const jsonResponse = await fetchResponse.json();
    return jsonResponse.status;
}

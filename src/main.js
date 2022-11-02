const core = require('@actions/core')
const github = require('@actions/github')
const helpers = require('./helpers')
const githubService = require('./services/github-service')
const azureDevOpsService = require('./services/azure-devops-service')

const getWorkItemId = async (env) => {
    core.debug('Getting PR info')
    const prInfo = await githubService.getPrInfo(env)
    if (!prInfo.success) {
        core.setFailed(prInfo.message)
    }

    const workItemIdResponse = githubService.getWorkItemIdFromPr(prInfo.body, prInfo.title)
    if (!workItemIdResponse.success) {
        core.setFailed(workItemIdResponse.message)
    }
    core.debug(`Found work item id from PR${ workItemIdResponse.workItemId }`)

    const updateWorkItemStateResponse = await azureDevOpsService.updateWorkItemState(workItemIdResponse.workItemId, env)
    if (!updateWorkItemStateResponse.success) {
        core.setFailed(updateWorkItemStateResponse.message)
    }
    core.debug(`Updated work item ${ workItemIdResponse.workItemId } to state ${ env.new_state }`)
}

const main = async () => {
    try {
        const vm = helpers.getValuesFromPayload(github.context.payload)
        await getWorkItemId(vm.env)
    } catch (error) {
        core.setFailed(error.message)
    }

}

// Call the main function to run the action
main()

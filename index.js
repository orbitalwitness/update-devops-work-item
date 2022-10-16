const core = require('@actions/core')
const github = require('@actions/github')
const helpers = require('./helpers')
const githubService = require('./services/github-service')
const azureDevOpsService =  require('./services/azure-devops-service')


main()

function main() {

    const vm = helpers.getValuesFromPayload(github.context.payload)
    if (vm.action !== 'closed') {
        getWorkItemId(vm.env)
    } else {
        core.setFailed('Pull request closed')
    }

}

const getWorkItemId = async (env) => {
    core.debug('Getting PR info')
    const prInfo = githubService.getPrInfo(env)
    if(!prInfo.success) {
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

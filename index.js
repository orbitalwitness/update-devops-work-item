import core from '@actions/core'
import github from '@actions/github'
import { getValuesFromPayload } from './helpers'
import {
    getPrInfo,
    getWorkItemIdFromPr
} from './services/github-service'
import { updateWorkItemState } from './services/azure-devops-service'


main()

function main() {

    const vm = getValuesFromPayload(github.context.payload)
    if (vm.action !== 'closed') {
        getWorkItemId(vm.env)
    } else {
        core.setFailed('Pull request closed')
    }

}

const getWorkItemId = async (env) => {
    core.debug('Getting PR info')
    const prInfo = getPrInfo(env)
    if(!prInfo.success) {
        core.setFailed(prInfo.message)
    }

    const workItemIdResponse = getWorkItemIdFromPr(prInfo.body, prInfo.title)
    if (!workItemIdResponse.success) {
        core.setFailed(workItemIdResponse.message)
    }
    core.debug(`Found work item id from PR${ workItemIdResponse.workItemId }`)

    const updateWorkItemStateResponse = await updateWorkItemState(workItemIdResponse.workItemId, env)
    if (!updateWorkItemStateResponse.success) {
        core.setFailed(updateWorkItemStateResponse.message)
    }
    core.debug(`Updated work item ${ workItemIdResponse.workItemId } to state ${ env.new_state }`)
}

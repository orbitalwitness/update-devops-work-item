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

    console.log(vm)

    if (vm.action !== 'closed') {
        getWorkItemId(vm.env)
    } else {
        core.setFailed('Pull request closed')
    }

}

const getWorkItemId = async (env) => {
    const prInfo = getPrInfo(env)
    const workItemIdResponse = getWorkItemIdFromPr(prInfo.body, prInfo.title)
    if (!workItemIdResponse.success) {
        core.setFailed(`Unable to get a work item id from the pull request title or body. ${ workItemIdResponse.message }`)
    }

    const updateWorkItemStateResponse = await updateWorkItemState(workItemIdResponse.workItemId, env)
    if (!updateWorkItemStateResponse.success) {
        core.setFailed(updateWorkItemStateResponse.message)
    }
}

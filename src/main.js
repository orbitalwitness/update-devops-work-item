import {
    debug,
    setFailed
} from '@actions/core'
import { context } from '@actions/github'

import { getPrInfo, getWorkItemIdFromPr } from './services/github-service'
import { updateWorkItemState} from './services/azure-devops-service'
import { getValuesFromPayload } from './helpers'

const getWorkItemId = async (env) => {
    debug('Getting PR info')
    const prInfo = await getPrInfo(env)
    if (!prInfo.success) {
        setFailed(prInfo.message)
    }

    const workItemIdResponse = getWorkItemIdFromPr(prInfo.body, prInfo.title)
    if (!workItemIdResponse.success) {
        setFailed(workItemIdResponse.message)
    }
    debug(`Found work item id from PR${ workItemIdResponse.workItemId }`)

    const updateWorkItemStateResponse = await updateWorkItemState(workItemIdResponse.workItemId, env)
    if (!updateWorkItemStateResponse.success) {
        setFailed(updateWorkItemStateResponse.message)
    }
    debug(`Updated work item ${ workItemIdResponse.workItemId } to state ${ env.new_state }`)
}

const main = async () => {
    try {
        const vm = getValuesFromPayload(context.payload)
        await getWorkItemId(vm.env)
    } catch (error) {
        setFailed(error.message)
    }

}

// Call the main function to run the action
main()

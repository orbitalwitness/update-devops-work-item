import {
    debug,
    setFailed
} from '@actions/core'
import { context } from '@actions/github'

import { getPrInfo, getWorkItemIdFromPr } from './services/github-service'
import { updateWorkItemState} from './services/azure-devops-service'
import { getValuesFromPayload } from './helpers'
import { IEnvironment } from './interfaces/environment.interface'
import { IGetPrInfoResponse } from './interfaces/github-service-responses.interface'

const getWorkItemId = async (env: IEnvironment) => {
    debug('Getting PR info')
    const prInfo: IGetPrInfoResponse = await getPrInfo(env)
    if (!prInfo.success) {
        setFailed(prInfo.message)
        return
    }

    if(!prInfo.body) {
        setFailed('Unable to retrieve the body of the PR')
        return
    }

    if(!prInfo.title) {
        setFailed('Unable to retrieve the title of the PR')
        return
    }

    const workItemIdResponse = getWorkItemIdFromPr(prInfo.body, prInfo.title)
    if (!workItemIdResponse.success) {
        setFailed(workItemIdResponse.message)
        return
    }
    debug(`Found work item id from PR${ workItemIdResponse.workItemId }`)

    const updateWorkItemStateResponse = await updateWorkItemState(workItemIdResponse.workItemId, env)
    if (!updateWorkItemStateResponse.success) {
        setFailed(updateWorkItemStateResponse.message)
        return
    }
    debug(`Updated work item ${ workItemIdResponse.workItemId } to state ${ env.new_state }`)
}

const main = async () => {
    try {
        const vm: IEnvironment = getValuesFromPayload(context.payload)
        await getWorkItemId(vm)
    } catch (error: any) {
        setFailed(error.message)
    }

}

// Call the main function to run the action
main()

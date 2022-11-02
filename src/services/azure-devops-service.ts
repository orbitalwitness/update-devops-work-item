import {
    getPersonalAccessTokenHandler,
    WebApi
} from 'azure-devops-node-api'

/**
 * Obtain a reference to the Azure Devops work item tracking API
 * @param env
 * @returns {Promise<IWorkItemTrackingApi>}
 */
const getAzureDevOpsClient = async (env) => {
    const token = env.ado_token
    const authHandler = getPersonalAccessTokenHandler(token)
    const connection = new WebApi(this.url, authHandler)
    return await connection.getWorkItemTrackingApi()
}

/**
 * Get the specified work item
 * @param workItemId
 * @param env
 * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
 */
export const getWorkItem = async (workItemId, env) => {
    const response = {
        code: 500,
        message: 'failed',
        success: false,
        workItem: null,
    }

    const client = await getAzureDevOpsClient(env)

    try {
        const workItem = await client.getWorkItem(workItemId)
        if (workItem === null || workItem === undefined) {
            response.code = 404
            response.message = 'Error getting work item: Work item is not found'
        } else {
            response.code = 200
            response.message = 'Success'
            response.success = true
            response.workItem = workItem
        }
    } catch (err) {
        response.message = response.message.concat(JSON.stringify(err))
        response.workItem = null
        response.success = false
    }

    return response
}

/**
 * Update the state of the specified work item.
 * @param workItemId
 * @param env
 * @returns {Promise<{code: number, success: boolean, workItem: null, message: string}>}
 */
export const updateWorkItemState = async (workItemId, env) => {
    const response = {
        code: 500,
        message: 'failed',
        success: false,
        workItem: null,
    }

    const client = await getAzureDevOpsClient(env)
    const workItemResponse = await getWorkItem(workItemId, env)
    if (!workItemResponse.success) {
        return workItemResponse
    }

    const workItem = workItemResponse.workItem
    const currentDescription = getWorkItemDescription(workItem)
    const currentState = getWorkItemState(workItem)

    if (currentState === 'Closed') {
        response.success = false
        response.message = 'Work item is closed and cannot be updated'
        return response
    }

    const newDescription = `${ currentDescription }<br />${ env.description }`

    try {
        const patchDocument = []
        patchDocument.push({
            op: 'add',
            path: '/fields/System.State',
            value: env.new_state,
        })
        patchDocument.push({
            op: 'add',
            path: '/fields/System.Description',
            value: newDescription,
        })

        const workItemResult = await client.updateWorkItem(
            [],
            patchDocument,
            workItemId,
        )

        // check to see if the work item is null or undefined
        if (workItemResult === null || workItemResult === undefined) {
            response.message =
                'Error updating work item: Work item result is null or undefined'
            console.log(response.message)
        } else {
            response.code = 200
            response.message = 'Success'
            response.success = true
            response.workItem = workItemResult
            console.log(`Work Item ${ workItemId } state is updated to ${ env.new_state }`)
        }

        return response
    } catch (err) {
        response.message = response.message.concat(JSON.stringify(err))
        response.workItem = null
        response.success = false
        console.log(`Error updating work item: ${ response.message }`)

        return response
    }
}

/**
 * Return the current state of the work item.
 * @param workItem
 * @returns {string}
 */
export const getWorkItemState = (workItem) => {
    return String(workItem.fields['System.State'])
}

/**
 * Return the current description of the work item.
 * @param workItem
 * @returns {string}
 */
export const getWorkItemDescription = (workItem) => {
    return String(workItem.fields['System.Description'])
}

const azdev = require(`azure-devops-node-api`)
const core = require(`@actions/core`)
const github = require(`@actions/github`)
const fetch = require('node-fetch')
global.Headers = fetch.Headers


main()

function main() {

    const env = process.env
    const context = github.context

    let vm = []

    vm = getValuesFromPayload(github.context.payload, env)

    console.log(vm)

    if (vm.action === 'closed') {
        getWorkItemId(vm.env)
    } else {
        core.setFailed()
    }

}

async function getWorkItemId(env) {

    let h = new Headers()
    let auth = 'token ' + env.ghToken
    h.append('Authorization', auth)
    try {
        const requesturl = 'https://api.github.com/repos/' + env.ghrepo_owner + '/' + env.ghrepo + '/pulls/' + env.pull_number
        const response = await fetch(requesturl, {
            method: 'GET',
            headers: h
        })
        const result = await response.json()

        const pulldetails = result.body

        const patternmatch = pulldetails.match(/\[(.*?)\]/)

        if (patternmatch) {

            const workitem = patternmatch[1]
            const newmatch = workitem.split(/#/)
            const workItemId = newmatch[1]
        }

    } catch (err) {
        core.setFailed(err)
    }
    try {
        const newrequesturl = 'https://api.github.com/repos/' + env.ghrepo_owner + '/' + env.ghrepo + '/pulls/' + env.pull_number + '/merge'
        const pullresponse = await fetch(newrequesturl, {
            method: 'GET',
            headers: h
        })

        const pullstatus = pullresponse.status

        if (workItemId === null) {
            core.setFailed()
            console.log('unable to find workitem id, please check if a workitem is linked to pull request')


        } else {
            updateworkitem(workItemId, env, pullstatus)
        }

    } catch (err) {
        core.setFailed(err.message)
    }
}

async function updateworkitem(workItemId, env, pullstatus) {

    try {

        let authHandler = azdev.getPersonalAccessTokenHandler(env.adoToken)
        let connection = new azdev.WebApi(env.orgUrl, authHandler)
        let client = await connection.getWorkItemTrackingApi()
        const workitem = await client.getWorkItem(workItemId)
        const currentdescr = String(workitem.fields['System.Description'])
        const currentState = workitem.fields['System.State']

        const type = await client.getWorkItemType(env.project, String(workitem.fields['System.WorkItemType']))

        if (currentState == env.closedState) {
            console.log('WorkItem Cannot be updated')
            core.setFailed()
        } else {
            const wstateslength = type.states.length
            for (let i = wstateslength - 1; i >= 0; i--) {
                if (currentState == type.states[i].name) {
                    const j = i
                    const newstate = type.states[++j].name
                }
            }

            let workItemSaveResult = null
            let mergestatus = []
            let newdescription = []
            if (pullstatus == '204') {

                mergestatus = 'Linked Pull Request merge is successful'
                newdescription = currentdescr + '<br />' + mergestatus
                let patchDocument = [
                    {
                        op: 'add',
                        path: '/fields/System.State',
                        value: newstate
                    },
                    {
                        op: 'add',
                        path: '/fields/System.Description',
                        value: newdescription
                    }
                ]

                workItemSaveResult = await client.updateWorkItem(
                    (customHeaders = []),
                    (document = patchDocument),
                    (id = workItemId),
                    (project = env.project),
                    (validateOnly = false)
                )
                console.log('Work Item ' + workItemId + ' state is updated to ' + newstate)
                return workItemSaveResult

            } else if (pullstatus == '404') {

                mergestatus = 'Pull Request closed without merge'
                newdescription = currentdescr + '<br />' + mergestatus

                let patchDocument = [
                    {
                        op: 'add',
                        path: '/fields/System.State',
                        value: currentState
                    },
                    {
                        op: 'add',
                        path: '/fields/System.Description',
                        value: newdescription
                    }
                ]

                let workItemSaveResult = null

                workItemSaveResult = await client.updateWorkItem(
                    (customHeaders = []),
                    (document = patchDocument),
                    (id = workItemId),
                    (project = env.project),
                    (validateOnly = false)
                )

                console.log('Work Item ' + workItemId + ' state is not updated')
                return workItemSaveResult

            } else {

                mergestatus = 'Unable to get pull request details'
                newdescription = currentdescr + '<br />' + mergestatus

                let patchDocument = [
                    {
                        op: 'add',
                        path: '/fields/System.State',
                        value: currentState
                    },
                    {
                        op: 'add',
                        path: '/fields/System.Description',
                        value: newdescription
                    }
                ]

                let workItemSaveResult = null

                workItemSaveResult = await client.updateWorkItem(
                    (customHeaders = []),
                    (document = patchDocument),
                    (id = workItemId),
                    (project = env.project),
                    (validateOnly = false)
                )
                console.log(mergestatus)
                return workItemSaveResult
            }

        }

        console.log('Work Item State Updated')

    } catch (err) {
        core.setFailed(err.message)
    }
}

function getValuesFromPayload(payload, env) {
    const vm = {
        action: payload.action !== undefined ? payload.action : '',

        env: {
            organization: env.ado_organization !== undefined ? env.ado_organization : '',
            orgUrl: env.ado_organization !== undefined ? 'https://dev.azure.com/' + env.ado_organization : '',
            adoToken: env.ado_token !== undefined ? env.ado_token : '',
            project: env.ado_project !== undefined ? env.ado_project : '',
            ghrepo_owner: env.gh_repo_owner !== undefined ? env.gh_repo_owner : '',
            ghrepo: env.gh_repo !== undefined ? env.gh_repo : '',
            pull_number: env.pull_number !== undefined ? env.pull_number : '',
            closedState: env.closedstate !== undefined ? env.closedstate : '',
            ghToken: env.gh_token !== undefined ? env.gh_token : '',
            newState: env.new_state !== undefined ? env.new_state : ''
        }
    }
    console.log('vm', vm)

    return vm
}

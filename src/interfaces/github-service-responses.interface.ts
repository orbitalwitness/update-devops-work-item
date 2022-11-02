import { IBaseResponse } from './base-response.interface'

export interface IGetPrInfoResponse extends IBaseResponse {
    body: string | null,
    status: string | null,
    title: string | null,
}

export interface IGetWorkItemIdFromPrResponse extends IBaseResponse {
    workItemId: string | null,
}

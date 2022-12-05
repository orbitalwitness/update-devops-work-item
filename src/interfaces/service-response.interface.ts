export interface IBaseResponse {
  code: number;
  message: string;
  success: boolean;
}

export interface IGetPrInfoResponse extends IBaseResponse {
  body: string | null;
  status: string | null;
  title: string | null;
  isDraft: boolean;
}

export interface IGetWorkItemIdFromPrResponse extends IBaseResponse {
  workItemId: string | null;
}

export interface IGetWorkItemResponse extends IBaseResponse {
  workItem: string | null;
}

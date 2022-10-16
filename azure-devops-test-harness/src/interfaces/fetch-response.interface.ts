import { IResponse } from './response.interface';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

export interface IFetchResponse extends IResponse {
  workItem: WorkItem | null;
}

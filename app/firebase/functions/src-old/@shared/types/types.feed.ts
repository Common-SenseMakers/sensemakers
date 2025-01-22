import { FetchParams } from './types.fetch';

export interface FeedQueryParams {
  labels: string[];
  keywords: string[];
  fetchParams: FetchParams;
}

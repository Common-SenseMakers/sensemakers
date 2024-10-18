import { array, number, object, string } from 'yup';

import { PostsQueryStatus } from '../@shared/types/types.posts';

export const getFeedSchema = object({
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
  status: string().oneOf([...Object.values(PostsQueryStatus)]),
  labels: array(string()).required(),
  keywords: array(string()).required(),
}).noUnknown(true);

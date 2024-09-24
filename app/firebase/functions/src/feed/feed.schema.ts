import { number, object, string } from 'yup';

export const getFeedSchema = object({
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
}).noUnknown(true);

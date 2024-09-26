import { array, number, object, string } from 'yup';

export const getFeedSchema = object({
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
  labelsUris: array(string()).required(),
}).noUnknown(true);

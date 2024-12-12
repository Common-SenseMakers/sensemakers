import { array, number, object, string } from 'yup';

export const fetchParamsSchema = object({
  expectedAmount: number().required(),
  sinceId: string().optional(),
  untilId: string().optional(),
});

export const smeanticsQueryParamsSchema = object({
  labels: array(string()).optional(),
  keywords: array(string()).optional(),
  refs: array(string()).optional(),
  topics: array(string()).optional(),
}).default(undefined);

export const queryParamsSchema = object({
  fetchParams: fetchParamsSchema.required(),
  userId: string().optional(),
  profileIds: array(string()).optional(),
  origins: array(string()).optional(),
  semantics: smeanticsQueryParamsSchema.optional(),
});

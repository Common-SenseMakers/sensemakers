import { array, object, string } from 'yup';

export const getPostSchema = object({
  postId: string().required(),
}).noUnknown(true);

export const approvePostSchema = object({
  id: string().required(),
  content: string().required(),
  semantics: string().required(),
  mirrors: array().of(object().shape({})).required(),
}).noUnknown(true);

export const createDraftPostSchema = object({
  postId: string().required(),
}).noUnknown(true);

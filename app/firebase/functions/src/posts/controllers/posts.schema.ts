import { array, number, object, string } from 'yup';

import { PostsQueryStatusParam } from '../../@shared/types/types.posts';

export const postIdValidation = object({
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

export const getUserPostsQuerySchema = object({
  status: string().oneOf([...Object.values(PostsQueryStatusParam)]),
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
}).noUnknown(true);

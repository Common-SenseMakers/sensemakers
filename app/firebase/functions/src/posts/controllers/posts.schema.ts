import { array, mixed, number, object, string } from 'yup';

import { PostsQueryStatus } from '../../@shared/types/types.posts';
import { PLATFORM } from 'src/@shared/types/types';

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
  status: string().oneOf([...Object.values(PostsQueryStatus)]),
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
}).noUnknown(true);

export const getUserProfileSchema = object({
  platformId: string().oneOf([...Object.values(PLATFORM)]),
  username: string().required(),
  labelsUris: string(),
  fetchParams: object({
    expectedAmount: number().required(),
    sinceId: string().optional(),
    untilId: string().optional(),
  }).required(),
}).noUnknown(true);


export const updatePostSchema = object({
  postId: string().required(),
  postUpdate: object()
    .shape({
      content: string().optional(),
      semantics: mixed().optional(),
      originalParsed: mixed().optional(),
      parsingStatus: string().optional(),
      parsedStatus: string().optional(),
      reviewedStatus: string().optional(),
      republishedStatus: string().optional(),
    })
    .noUnknown(true)
    .required(),
})
  .required()
  .noUnknown(true);

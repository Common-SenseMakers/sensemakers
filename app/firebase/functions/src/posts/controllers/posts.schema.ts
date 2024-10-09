import { array, mixed, number, object, string } from 'yup';

import { PLATFORM } from '../../@shared/types/types.platforms';
import { PostsQueryStatus } from '../../@shared/types/types.posts';

export const postIdValidation = object({
  postId: string().required(),
}).noUnknown(true);

export const approvePostSchema = object({
  post: object({
    id: string().required(),
    content: array().of(
      object().shape({
        content: string().required(),
      })
    ),
    semantics: string().required(),
    mirrors: array().of(object().shape({})).required(),
  }).required(),
  platformIds: array()
    .of(string().oneOf([...Object.values(PLATFORM)]))
    .required(),
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
  username: string().required(),
  platformId: string().oneOf([...Object.values(PLATFORM)]),
}).noUnknown(true);

export const getUserProfilePostsSchema = object({
  platformId: string().oneOf([...Object.values(PLATFORM)]),
  username: string().required(),
  labelsUris: array().of(string()),
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

export const retractPostSchema = object({
  postId: string().required(),
  platformId: string().oneOf([...Object.values(PLATFORM)]),
  post_id: string().required(),
}).noUnknown(true);

import { array, mixed, number, object, string } from 'yup';

import { PLATFORM } from '../../@shared/types/types.platforms';

export const deletePostSchema = object({
  postId: string().required(),
}).noUnknown(true);

export const postIdValidation = object({
  postId: string().required(),
}).noUnknown(true);

export const getPostSchema = object({
  postId: string().required(),
  config: object({
    addMirrors: string().optional(),
    addAggregatedLabels: string().optional(),
  })
    .optional()
    .default(undefined),
}).noUnknown(true);

export const createDraftPostSchema = object({
  postId: string().required(),
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

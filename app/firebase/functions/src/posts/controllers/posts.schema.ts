import { object, string } from 'yup';

export const getPostSchema = object({
  postId: string().required(),
}).noUnknown(true);

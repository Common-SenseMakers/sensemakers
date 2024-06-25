import { APP_URL } from '../config/config.runtime';

export const getPostUrl = (postId: string) => {
  return `${APP_URL}/posts/${postId}`;
};

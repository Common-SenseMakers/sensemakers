import { AppPostFull } from '../@shared/types/types.posts';

export const canReadPost = (post: AppPostFull, userId?: string) => {
  if (post.authorUserId && userId && post.authorUserId === userId) {
    return true;
  }

  /** */
  // return false;
  return true;
};

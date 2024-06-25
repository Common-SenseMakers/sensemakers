import {
  AppPostFull,
  AppPostRepublishedStatus,
} from '../@shared/types/types.posts';

export const canReadPost = (post: AppPostFull, userId?: string) => {
  if (post.republishedStatus !== AppPostRepublishedStatus.PENDING) {
    return true;
  }

  if (userId && post.authorId === userId) {
    return true;
  }

  return false;
};

import {
  AppPostFull,
  AppPostRepublishedStatus,
} from '../@shared/types/types.posts';

export const canReadPost = (post: AppPostFull, userId?: string) => {
  if (
    [
      AppPostRepublishedStatus.AUTO_REPUBLISHED,
      AppPostRepublishedStatus.REPUBLISHED,
    ].includes(post.republishedStatus)
  ) {
    return true;
  }

  if (post.authorUserId && userId && post.authorUserId === userId) {
    return true;
  }

  /** */
  // return false;
  return true;
};

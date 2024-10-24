import { AppPostRepublishedStatus } from '../../shared/types/types.posts';
import { PostFetchContext } from './use.post.fetch';
import { PostUpdateContext } from './use.post.update';

export interface PostPublishContext {
  unpublish: () => Promise<void>;
  publish: () => Promise<void>;
}

export const usePostPublish = (
  fetched: PostFetchContext,
  updated: PostUpdateContext
): PostPublishContext => {
  const publishOrUnpublish = async (
    republishedStatus: AppPostRepublishedStatus
  ) => {
    if (!updated.postMerged) {
      throw new Error(`Unexpected post not found`);
    }
    await updated.updatePost({
      republishedStatus,
    });
  };

  return {
    publish: () => publishOrUnpublish(AppPostRepublishedStatus.REPUBLISHED),
    unpublish: () => publishOrUnpublish(AppPostRepublishedStatus.UNREPUBLISHED),
  };
};

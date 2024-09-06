import { useMemo } from 'react';

import { AppPostFull } from '../shared/types/types.posts';
import { PostFetchContext } from './use.current.post';
import { PostUpdateContext } from './use.post.update';

export interface PostMergeContext {
  post?: AppPostFull;
}

export const usePostMerge = (
  fetched: PostFetchContext,
  update: PostUpdateContext,
  postInit?: AppPostFull
) => {
  /** combine edited and fetched posts to get the current local version of a post */
  const post = useMemo<AppPostFull | undefined>(() => {
    if (fetched.isLoading) return postInit;
    if (fetched.post && fetched.post !== null) {
      return { ...fetched.post, ...update.postEdited };
    }
    return undefined;
  }, [fetched.post, postInit, update.postEdited, fetched.isLoading]);

  return {
    post,
  };
};

import { useMemo } from 'react';

import { AppPostStatus, getPostStatuses } from '../posts.helper';
import { PostFetchContext } from './use.post.fetch';

export interface PostDerivedContext {
  statuses: AppPostStatus;
}

export const usePostDerived = (fetched: PostFetchContext) => {
  const postIdFinal = useMemo(() => fetched.post?.id, [fetched.post]);
  const statuses = useMemo(() => getPostStatuses(fetched.post), [fetched.post]);

  return { statuses, postId: postIdFinal };
};

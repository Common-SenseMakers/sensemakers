import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../../api/app.fetch';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { PlatformPostDraft } from '../../shared/types/types.platform.posts';
import { PLATFORM } from '../../shared/types/types.platforms';
import { TwitterPlatformPost } from '../../shared/types/types.twitter';
import { AppUserRead } from '../../shared/types/types.user';
import { ConnectedUser } from '../../user-login/contexts/AccountContext';
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

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
  nanopubDraft: PlatformPostDraft | undefined;
  statuses: AppPostStatus;
}

export const usePostDerived = (
  fetched: PostFetchContext,
  connectedUser?: ConnectedUser
) => {
  const appFetch = useAppFetch();

  const [requesteDraft, setRequestedDraft] = useState(false);

  /** create drafts if connected user has account and draft for that platform does
   * not exists */
  useEffect(() => {
    const nanopubAccount =
      connectedUser?.profiles && connectedUser?.profiles[PLATFORM.Nanopub];
    if (nanopubAccount && !nanopubDraft && !requesteDraft) {
      /** if draft not available, create it */
      setRequestedDraft(true);
      appFetch('/api/posts/createDraft', { postId: fetched.postId }).then(
        () => {
          setRequestedDraft(false);
        }
      );
    }
  }, [fetched.post, connectedUser]);

  const postIdFinal = useMemo(() => fetched.post?.id, [fetched.post]);

  const nanopubDraft = useMemo(() => {
    const nanopub = fetched.post?.mirrors?.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    return nanopub.draft;
  }, [fetched.post]);

  const statuses = useMemo(() => getPostStatuses(fetched.post), [fetched.post]);

  return { nanopubDraft, statuses, postId: postIdFinal };
};

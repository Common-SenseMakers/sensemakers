import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { NotificationFreq } from '../shared/types/types.notifications';
import {
  PlatformPost,
  PlatformPostDraft,
} from '../shared/types/types.platform.posts';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterThread } from '../shared/types/types.twitter';
import {
  AppUserRead,
  AutopostOption,
  PLATFORM,
} from '../shared/types/types.user';
import { getAccount } from '../user-login/user.helper';
import { AppPostStatus, getPostStatuses } from './posts.helper';
import { PostFetchContext } from './use.current.post';

export interface PostDerivedContext {
  author: AppUserRead;
  nanopubDraft: PlatformPostDraft | undefined;
  tweet?: PlatformPost<TwitterThread>;
  statuses: AppPostStatus;
}

export const usePostDerived = (
  fetched: PostFetchContext,
  connectedUser?: AppUserRead,
  postInit?: AppPostFull
) => {
  const appFetch = useAppFetch();

  const [requesteDraft, setRequestedDraft] = useState(false);

  /** create drafts if connected user has account and draft for that platform does
   * not exists */
  useEffect(() => {
    const nanopubAccount = getAccount(connectedUser, PLATFORM.Nanopub);
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

  /** TODO: This is a placeholder. The post author may not be the connected user. We can probably have an
   * endpoint to get user profiles by userIds */
  const author: AppUserRead = {
    userId: '1234',
    signupDate: 1720702932,
    settings: {
      notificationFreq: NotificationFreq.None,
      autopost: {
        [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL },
      },
    },
    twitter: [
      {
        user_id: '1234',
        read: true,
        write: true,
        profile: {
          id: '1234',
          name: 'SenseNet Bot',
          username: 'sense_nets_bot',
          profile_image_url:
            'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
        },
      },
    ],
  };

  const tweet = fetched.post?.mirrors?.find(
    (m) => m.platformId === PLATFORM.Twitter
  );
  const postIdFinal = useMemo(() => fetched.post?.id, [fetched.post]);

  const nanopubDraft = useMemo(() => {
    const nanopub = fetched.post?.mirrors?.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    return nanopub.draft;
  }, [fetched.post]);

  const statuses = useMemo(() => getPostStatuses(fetched.post), [fetched.post]);

  return { author, nanopubDraft, tweet, statuses, postId: postIdFinal };
};

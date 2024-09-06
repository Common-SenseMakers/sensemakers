import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
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

export interface CurrentPostContext {
  postId?: string;
  post: AppPostFull | undefined;
  isLoading: boolean;
  author: AppUserRead;
  nanopubDraft: PlatformPostDraft | undefined;
  tweet?: PlatformPost<TwitterThread>;
  statuses: AppPostStatus;
  refetch: () => void;
}

const DEBUG = false;

/** hook in charge of fething the current post, and keeping it
 * and its derived values updated in real time */
export const useCurrentPost = (
  connectedUser?: AppUserRead,
  _postId?: string,
  postInit?: AppPostFull
): CurrentPostContext => {
  const appFetch = useAppFetch();

  const [requesteDraft, setRequestedDraft] = useState(false);

  const postId = useMemo(
    () => (_postId ? _postId : (postInit as AppPostFull).id),
    [_postId, postInit]
  );

  /** if postInit not provided get post from the DB */
  const {
    data: post,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['postId', postId, connectedUser],
    queryFn: () => {
      try {
        if (postId) {
          return appFetch<AppPostFull>('/api/posts/get', { postId });
        }
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
      }
    },
  });

  /**
   * subscribe to real time updates of this post and trigger a refetch everytime
   * one is received*/
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(`post-${postId}`, refetch);
    return () => {
      if (DEBUG) console.log('unsubscribing to updates post', postId);
      unsubscribe();
    };
  }, []);

  /**
   * subscribe to real time updates of this post platform posts */
  useEffect(() => {
    if (post && post.mirrors) {
      const unsubscribes = post.mirrors.map((m) => {
        return {
          unsubscribe: subscribeToUpdates(`platformPost-${m.id}`, refetch),
          platformPostId: m.id,
        };
      });

      return () => {
        unsubscribes.forEach((unsubscribe) => {
          if (DEBUG)
            console.log(
              'unsubscribing to updates platformPost',
              unsubscribe.platformPostId
            );
          unsubscribe.unsubscribe();
        });
      };
    }
  }, [post]);

  /** create drafts if connected user has account and draft for that platform does
   * not exists */
  useEffect(() => {
    const nanopubAccount = getAccount(connectedUser, PLATFORM.Nanopub);
    if (nanopubAccount && !nanopubDraft && !requesteDraft) {
      /** if draft not available, create it */
      setRequestedDraft(true);
      appFetch('/api/posts/createDraft', { postId }).then(() => {
        setRequestedDraft(false);
      });
    }
  }, [post, connectedUser]);

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

  const tweet = post?.mirrors?.find((m) => m.platformId === PLATFORM.Twitter);
  const postIdFinal = useMemo(() => post?.id, [post]);

  const nanopubDraft = useMemo(() => {
    const nanopub = post?.mirrors?.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    return nanopub.draft;
  }, [post]);

  const statuses = useMemo(() => getPostStatuses(post), [post]);

  return {
    postId: postIdFinal,
    post,
    isLoading,
    author,
    nanopubDraft,
    tweet,
    statuses,
    refetch,
  };
};

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import { AppPostFull } from '../shared/types/types.posts';
import { AppUserRead } from '../shared/types/types.user';

export interface PostFetchContext {
  postId?: string;
  post: AppPostFull | undefined;
  isLoading: boolean;
  refetch: () => void;
}

const DEBUG = false;

/** hook in charge of fething the current post, and keeping it
 * and its derived values updated in real time */
export const usePostFetch = (
  connectedUser?: AppUserRead,
  _postId?: string,
  postInit?: AppPostFull
): PostFetchContext => {
  const appFetch = useAppFetch();

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

  return {
    postId,
    post,
    isLoading,
    refetch,
  };
};

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { useAppFetch } from '../../api/app.fetch';
import { subscribeToUpdates } from '../../firestore/realtime.listener';
import { AppPostFull } from '../../shared/types/types.posts';
import { ConnectedUser } from '../../user-login/contexts/AccountContext';

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
  connectedUser?: ConnectedUser,
  _postId?: string,
  postInit?: AppPostFull
): PostFetchContext => {
  const appFetch = useAppFetch();

  const postId = useMemo(() => {
    if (DEBUG)
      console.log(`useMemo postId ${_postId || ''}`, { _postId, postInit });
    const actualPostId = _postId ? _postId : (postInit as AppPostFull).id;
    return actualPostId;
  }, [_postId, postInit]);

  /** if postInit not provided get post from the DB */
  const {
    data: _post,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['postId', postId, connectedUser],
    queryFn: () => {
      try {
        if (postId) {
          if (DEBUG) console.log('fetching', { postId });
          return appFetch<AppPostFull>('/api/posts/get', { postId });
        }
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
  });

  const post = _post || postInit;

  const _refetch = useCallback(() => {
    if (DEBUG) console.log(`updated to post${postId} detected - refetching`);
    refetch().catch(console.error);
  }, [postId, refetch]);

  /**
   * subscribe to real time updates of this post and trigger a refetch everytime
   * one is received*/
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(`post-${postId}`, _refetch);
    return () => {
      if (DEBUG) console.log('unsubscribing to updates post', postId);
      unsubscribe();
    };
  }, [_refetch, postId]);

  /**
   * subscribe to real time updates of this post platform posts */
  useEffect(() => {
    if (DEBUG) console.log(`useEffect post ${postId}`, { post });

    if (post && post.mirrors) {
      const unsubscribes = post.mirrors.map((m) => {
        return {
          unsubscribe: subscribeToUpdates(`platformPost-${m.id}`, () => {
            refetch().catch(console.error);
          }),
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
  }, [post, postId, refetch]);

  return {
    postId,
    post,
    isLoading,
    refetch: _refetch,
  };
};

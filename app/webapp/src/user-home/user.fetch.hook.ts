import { useEffect, useRef } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
} from '../shared/types/types.posts';
import { usePostsFetcher } from './posts.fetch.hook';
import { useQueryFilter } from './query.filter.hook';

const PAGE_SIZE = 5;

const DEBUG = false;

export const usePostsFetch = () => {
  const appFetch = useAppFetch();
  const { status } = useQueryFilter();

  const onPostsAdded = (newPosts: AppPostFull[]) => {
    /** subscribe to updates */
    newPosts.forEach((post) => {
      if (!unsubscribeCallbacks.current) {
        unsubscribeCallbacks.current = {};
      }

      const current = unsubscribeCallbacks.current[post.id];
      /** unsubscribe from previous */
      if (current) {
        if (DEBUG) console.log(`current unsubscribe for post ${post.id} found`);
        current();
      }

      const unsubscribe = subscribeToUpdates(`post-${post.id}`, () => {
        if (DEBUG) console.log(`update detected`, post.id);
        refetchPost(post.id);
      });

      if (DEBUG)
        console.log(
          `unsubscribefor post ${post.id} stored on unsubscribeCallbacks`
        );
      unsubscribeCallbacks.current[post.id] = unsubscribe;
    });

    /** trigger parse if not parsed and not parsing */
    newPosts.forEach((post) => {
      if (
        post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsingStatus !== AppPostParsingStatus.PROCESSING
      ) {
        // async trigger parse
        appFetch(`/api/posts/parse`, { postId: post.id });
      }
    });
  };

  /** unsubscribe from all updates when unmounting */
  useEffect(() => {
    return () => {
      Object.entries(unsubscribeCallbacks.current).forEach(
        ([postId, unsubscribe]) => {
          if (DEBUG)
            console.log(`unsubscribing from post ${postId} at unmount`);
          unsubscribe();
        }
      );
    };
  }, []);

  const onRemovePost = (postId: string) => {
    unsubscribeCallbacks.current[postId]?.();
  };

  const onRemoveAll = () => {
    /** unsubscribe from all posts */
    Object.entries(unsubscribeCallbacks.current).forEach(
      ([postId, unsubscribe]) => {
        if (DEBUG) console.log(`unsubscribing from ${postId}`);
        unsubscribe();
      }
    );
  };

  const {
    posts,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    removePost,
    moreToFetch,
  } = usePostsFetcher(
    'api/posts/getOfUser',
    status,
    onPostsAdded,
    onRemovePost,
    onRemoveAll
  );

  return {
    posts,
    removePost,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    status,
    moreToFetch,
  };
};

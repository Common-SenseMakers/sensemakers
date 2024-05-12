import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useQueryFilter } from './useQueryFilter';

const PAGE_SIZE = 5;

const DEBUG = false;

export const usePostsFetch = () => {
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();
  const { status } = useQueryFilter();

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const [fetchedFirst, setFetchedFirst] = useState(false);

  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [errorFetchingOlder, setErrorFetchingOlder] = useState<Error>();

  const [isFetchingNewer, setIsFetchingNewer] = useState(false);
  const [errorFetchingNewer, setErrorFetchingNewer] = useState<Error>();

  const unsubscribeCallbacks = useRef<Record<string, () => void>>({});

  /** refetch a post and overwrite its value in the array */
  const refetchPost = useCallback(
    async (postId: string) => {
      if (!connectedUser) {
        return;
      }

      try {
        const post = await appFetch<AppPostFull>(
          `/api/posts/get`,
          { postId },
          true
        );
        if (DEBUG) console.log(`refetch post returned`, { post, posts });

        setPosts((prev) => {
          const newPosts = [...prev];
          const ix = prev.findIndex((p) => p.id === postId);
          if (DEBUG) console.log(`setPosts called`, { ix, newPosts });
          if (ix !== -1) {
            newPosts[ix] = post;
          }
          return newPosts;
        });
      } catch (e) {
        console.error(e);
        throw new Error(`Error fetching post ${postId}`);
      }
    },
    [posts, connectedUser]
  );

  const addPosts = useCallback(
    (posts: AppPostFull[], position: 'start' | 'end') => {
      if (DEBUG) console.log(`addPosts called`, { posts });

      /** add posts  */
      setPosts((prev) => {
        const allPosts =
          position === 'end' ? prev.concat(posts) : posts.concat(prev);
        if (DEBUG) console.log(`pushing posts`, { prev, allPosts });
        return allPosts;
      });

      /** subscribe to updates */
      posts.forEach((post) => {
        if (!unsubscribeCallbacks.current) {
          unsubscribeCallbacks.current = {};
        }

        const current = unsubscribeCallbacks.current[post.id];
        /** unsubscribe from previous */
        if (current) {
          if (DEBUG)
            console.log(`current unsubscribe for post ${post.id} found`);
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
      posts.forEach((post) => {
        if (
          post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
          post.parsingStatus !== AppPostParsingStatus.PROCESSING
        ) {
          // async trigger parse
          appFetch(`/api/posts/parse`, { postId: post.id });
        }
      });
    },
    [appFetch, refetchPost]
  );

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

  const removeAllPosts = () => {
    /** unsubscribe from all posts */
    Object.entries(unsubscribeCallbacks.current).forEach(
      ([postId, unsubscribe]) => {
        if (DEBUG) console.log(`unsubscribing from ${postId}`);
        unsubscribe();
      }
    );
    /** reset the array */
    if (DEBUG) console.log(`settings pots to empty array`);
    setPosts([]);
  };

  /** first data fill happens everytime the posts are empty and the firstFetched is false */
  useEffect(() => {
    if (posts.length === 0 && !fetchedFirst && connectedUser) {
      if (DEBUG) console.log('first fetch');
      _fetchOlder(undefined);
    }
  }, [posts, fetchedFirst, connectedUser]);

  const reset = () => {
    if (DEBUG) console.log('resetting posts');
    removeAllPosts();
    setFetchedFirst(false);
  };

  /** reset at every status change  */
  useEffect(() => {
    reset();
  }, [status]);

  const _oldestPostId = useMemo(() => {
    const oldest = posts ? posts[posts.length - 1]?.id : undefined;
    if (DEBUG) console.log(`recomputing oldest _oldestPostId ${oldest}`);
    return oldest;
  }, [posts]);

  /** fetch for more post backwards */
  const _fetchOlder = useCallback(
    async (oldestPostId?: string) => {
      if (!connectedUser) {
        return;
      }

      if (DEBUG) console.log(`fetching for older`);
      setIsFetchingOlder(true);
      setFetchedFirst(true);
      try {
        const params: UserPostsQuery = {
          status,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for older`, params);
        const readPosts = await appFetch<AppPostFull[], UserPostsQuery>(
          '/api/posts/getOfUser',
          params
        );

        if (DEBUG) console.log(`fetching for older retrieved`, readPosts);
        addPosts(readPosts, 'end');
        setIsFetchingOlder(false);
      } catch (e: any) {
        setIsFetchingOlder(false);
        setErrorFetchingOlder(e);
      }
    },
    [appFetch, status, connectedUser]
  );

  /** public function to trigger fetching for older posts */
  const fetchOlder = useCallback(() => {
    if (DEBUG) console.log(`external fetchOlder`, _oldestPostId);
    _fetchOlder(_oldestPostId);
  }, [_fetchOlder, _oldestPostId]);

  const newestPostId = useMemo(() => {
    const newest = posts ? posts[0]?.id : undefined;
    if (DEBUG) console.log(`recomputing newestPostId ${newest}`);
    return newest;
  }, [posts]);

  const _fetchNewer = useCallback(
    async (_newestPostId: string) => {
      if (!connectedUser || !_newestPostId) {
        return;
      }

      if (DEBUG) console.log(`fetching for newer`);
      setIsFetchingNewer(true);

      try {
        const params: UserPostsQuery = {
          status,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            sinceId: _newestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for newer`, params);
        const readPosts = await appFetch<AppPostFull[], UserPostsQuery>(
          '/api/posts/getOfUser',
          params
        );

        if (DEBUG) console.log(`fetching for newer retrieved`, readPosts);
        addPosts(readPosts, 'start');
        setIsFetchingNewer(false);
      } catch (e: any) {
        setIsFetchingNewer(false);
        setErrorFetchingNewer(e);
      }
    },
    [appFetch, connectedUser]
  );

  /** public function to trigger fetching for older posts */
  const fetchNewer = useCallback(() => {
    if (newestPostId) {
      if (DEBUG) console.log(`external fetchNewer`, newestPostId);
      _fetchNewer(newestPostId);
    }
  }, [_fetchNewer, newestPostId]);

  /** turn off errors automatically */
  useEffect(() => {
    if (errorFetchingNewer) {
      setErrorFetchingNewer(undefined);
    }
    if (errorFetchingOlder) {
      setErrorFetchingOlder(undefined);
    }
  }, [errorFetchingNewer, errorFetchingOlder]);

  const removePost = (postId: string) => {
    if (DEBUG) console.log(`removing post ${postId} from list`);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    unsubscribeCallbacks.current[postId]?.();
  };

  return {
    posts,
    removePost,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
  };
};

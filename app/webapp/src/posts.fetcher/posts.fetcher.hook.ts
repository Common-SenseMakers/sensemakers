import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import { FetchParams } from '../shared/types/types.fetch';
import { AppPostFull, PostsQuery } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { arraysEqual } from '../utils/general';

const DEBUG = false;

export interface PostFetcherInterface {
  posts?: AppPostFull[];
  isLoading: boolean;
  isFetchingOlder: boolean;
  errorFetchingOlder?: Error;
  isFetchingNewer: boolean;
  errorFetchingNewer?: Error;
  fetchOlder: () => void;
  fetchNewer: () => void;
  getPost: (postId: string) => AppPostFull | undefined;
  removePost: (postId: string) => void;
  moreToFetch: boolean;
  getNextAndPrev: (postId?: string) => {
    prevPostId?: string;
    nextPostId?: string;
  };
}

export interface FetcherConfig {
  endpoint: string;
  queryParams: PostsQuery;
  subscribe?: boolean;
  onPostsAdded?: (posts: AppPostFull[]) => void;
  PAGE_SIZE?: number;
  DEBUG_PREFIX?: string;
}

/**
 * Handles one array of posts by keeping track of the newest and oldest post ids and
 * fething newer and older posts as requested by a consuming component
 */
export const usePostsFetcher = (input: FetcherConfig): PostFetcherInterface => {
  const { connectedUser, connectedSourcePlatforms } = useAccountContext();

  const {
    endpoint,
    queryParams,
    subscribe,
    onPostsAdded,
    PAGE_SIZE: _PAGE_SIZE,
  } = input;

  const DEBUG_PREFIX = input.DEBUG_PREFIX || '';

  const PAGE_SIZE = _PAGE_SIZE || 5;

  const appFetch = useAppFetch();

  const [posts, setPosts] = useState<AppPostFull[] | undefined>(undefined);
  const [fetchedOlderFirst, setFetchedOlderFirst] = useState(false);
  const [fetchedNewerFirst, setFetchedNewerFirst] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [errorFetchingOlder, setErrorFetchingOlder] = useState<Error>();

  const [isFetchingNewer, setIsFetchingNewer] = useState(false);
  const [errorFetchingNewer, setErrorFetchingNewer] = useState<Error>();
  const [moreToFetch, setMoreToFetch] = useState(true);

  const [connectedSourcePlatformsInit] = useState(connectedSourcePlatforms);

  const unsubscribeCallbacks = useRef<Record<string, () => void>>({});

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  /** refetch a post and overwrite its value in the array */
  const refetchPost = useCallback(
    async (postId: string) => {
      // skip fetching if we are in the middle of a code management
      if (!connectedUser || code) {
        return;
      }

      try {
        const post = await appFetch<AppPostFull>(
          `/api/posts/get`,
          { postId },
          true
        );

        if (DEBUG)
          console.log(`${DEBUG_PREFIX}refetch post returned`, {
            post,
            posts,
          });

        const shouldRemove = (() => {
          return false;
        })();

        setPosts((prev) => {
          const newPosts = prev ? [...prev] : [];
          const ix = prev ? prev.findIndex((p) => p.id === postId) : -1;

          if (DEBUG)
            console.log(`${DEBUG_PREFIX}setPosts called`, {
              ix,
              newPosts,
            });

          if (ix !== -1) {
            if (DEBUG)
              console.log(`${DEBUG_PREFIX}settingPost`, {
                ix,
                shouldRemove,
              });
            if (shouldRemove) {
              newPosts.splice(ix, 1);
            } else {
              newPosts[ix] = post;
            }
          }
          return newPosts;
        });
      } catch (e) {
        console.error(e);
        throw new Error(`${DEBUG_PREFIX || ''}Error fetching post ${postId}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedUser, code, posts]
  );

  const setPostsCallback = useCallback(
    (
      prev: AppPostFull[] | undefined,
      candidateNewPosts: AppPostFull[],
      position: 'start' | 'end'
    ) => {
      /** filter existing posts */
      const newPosts =
        prev !== undefined
          ? candidateNewPosts.filter(
              (post) => !prev.find((prevPost) => prevPost.id === post.id)
            )
          : candidateNewPosts;

      /** subscribe to updates */
      newPosts.forEach((post) => {
        if (!unsubscribeCallbacks.current) {
          unsubscribeCallbacks.current = {};
        }

        const current = unsubscribeCallbacks.current[post.id];
        /** unsubscribe from previous */
        if (current) {
          if (DEBUG)
            console.log(
              `${DEBUG_PREFIX}current unsubscribe for post ${post.id} found`
            );
          current();
        }

        if (subscribe) {
          const unsubscribe = subscribeToUpdates(`post-${post.id}`, () => {
            if (DEBUG) console.log(`${DEBUG_PREFIX}update detected`, post.id);
            refetchPost(post.id).catch((e) => {
              console.error(e);
            });
          });

          if (DEBUG)
            console.log(
              `${DEBUG_PREFIX}unsubscribefor post ${post.id} stored on unsubscribeCallbacks`
            );
          unsubscribeCallbacks.current[post.id] = unsubscribe;
        }
      });

      const allPosts =
        position === 'end'
          ? prev
            ? prev.concat(newPosts)
            : newPosts
          : prev
            ? newPosts.reverse().concat(prev)
            : newPosts;

      if (DEBUG)
        console.log(`${DEBUG_PREFIX}pushing posts`, { prev, allPosts });
      return allPosts;
    },
    [DEBUG_PREFIX, refetchPost, subscribe]
  );

  const addPosts = useCallback(
    (newPosts: AppPostFull[], position: 'start' | 'end') => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}addPosts called`, { posts: newPosts });

      /** add posts  */
      setPosts((prev) => setPostsCallback(prev, newPosts, position));

      if (onPostsAdded) {
        onPostsAdded(newPosts);
      }
    },
    [DEBUG_PREFIX, onPostsAdded, setPostsCallback]
  );

  /** unsubscribe from all updates when unmounting */
  useEffect(() => {
    return () => {
      Object.entries(unsubscribeCallbacks.current).forEach(
        ([postId, unsubscribe]) => {
          if (DEBUG)
            console.log(
              `${DEBUG_PREFIX}unsubscribing from post ${postId} at unmount`
            );
          unsubscribe();
        }
      );
    };
  }, [DEBUG_PREFIX]);

  const removeAllPosts = useCallback(() => {
    /** unsubscribe from all posts */
    Object.entries(unsubscribeCallbacks.current).forEach(
      ([postId, unsubscribe]) => {
        if (DEBUG) console.log(`${DEBUG_PREFIX}unsubscribing from ${postId}`);
        unsubscribe();
      }
    );
    /** reset the array */
    if (DEBUG) console.log(`${DEBUG_PREFIX}settings pots to empty array`);
    setPosts([]);
  }, [DEBUG_PREFIX]);

  const reset = useCallback(() => {
    if (DEBUG) console.log(`${DEBUG_PREFIX}resetting posts`);
    removeAllPosts();
    setFetchedOlderFirst(false);
    setIsLoading(true);
  }, [DEBUG_PREFIX, removeAllPosts]);

  const _oldestPostId = useMemo(() => {
    const oldest = posts ? posts[posts.length - 1]?.id : undefined;
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX}recomputing oldest _oldestPostId ${oldest || ''}`
      );
    return oldest;
  }, [DEBUG_PREFIX, posts]);

  /** fetch for more post backwards */
  const _fetchOlder = useCallback(
    async (oldestPostId?: string) => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching for older`, {
          oldestPostId,
          connectedUser,
          isFetchingOlder,
          code,
        });
      if (!connectedUser || isFetchingOlder || code) {
        return;
      }

      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching for older`, {
          oldestPostId,
          isFetchingOlder,
          fetchedOlderFirst,
        });
      setIsFetchingOlder(true);

      try {
        const params: PostsQuery = {
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
          ...queryParams,
        };
        if (DEBUG)
          console.log(`${DEBUG_PREFIX}fetching for older - twitter`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG)
          console.log(`${DEBUG_PREFIX}fetching for older retrieved`, readPosts);
        addPosts(readPosts, 'end');
        setIsFetchingOlder(false);
        setIsLoading(false);
        if (
          readPosts.length < (params.fetchParams as FetchParams).expectedAmount
        ) {
          setMoreToFetch(false);
        } else {
          setMoreToFetch(true);
        }
      } catch (e) {
        console.error(`${DEBUG_PREFIX}error fetching older`, {
          e,
          isFetchingOlder,
        });
        setIsFetchingOlder(false);
        setErrorFetchingOlder(e as Error);
        setIsLoading(false);
      }
    },
    [
      DEBUG_PREFIX,
      connectedUser,
      isFetchingOlder,
      code,
      fetchedOlderFirst,
      queryParams,
      PAGE_SIZE,
      appFetch,
      endpoint,
      addPosts,
    ]
  );

  /** public function to trigger fetching for older posts */
  const fetchOlder = useCallback(() => {
    if (DEBUG) console.log(`${DEBUG_PREFIX}external fetchOlder`, _oldestPostId);
    _fetchOlder(_oldestPostId).catch((e) => {
      console.error(e);
    });
  }, [DEBUG_PREFIX, _fetchOlder, _oldestPostId]);

  /** reset at every status change  */
  useEffect(() => {
    reset();
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX}_fetchOlder due to status, labels, keywords, endpoint change`,
        {
          queryParams,
          endpoint,
          fetchedOlderFirst,
        }
      );
    _fetchOlder(undefined).catch((e) => {
      console.error(e);
    });
  }, [
    queryParams,
    endpoint,
    reset,
    DEBUG_PREFIX,
    fetchedOlderFirst,
    _fetchOlder,
  ]);

  const newestPostId = useMemo(() => {
    const newest = posts ? posts[0]?.id : undefined;
    if (DEBUG)
      console.log(`${DEBUG_PREFIX}recomputing newestPostId ${newest || ''}`);
    return newest;
  }, [DEBUG_PREFIX, posts]);

  const _fetchNewer = useCallback(
    async (_newestPostId: string) => {
      if (!connectedUser || !_newestPostId || code) {
        return;
      }

      if (DEBUG) console.log(`${DEBUG_PREFIX}fetching for newer`);
      setIsFetchingNewer(true);
      setFetchedNewerFirst(true);

      try {
        const params: PostsQuery = {
          ...queryParams,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            sinceId: _newestPostId,
          },
        };
        if (DEBUG) console.log(`${DEBUG_PREFIX}fetching for newer`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG)
          console.log(`${DEBUG_PREFIX}fetching for newer retrieved`, readPosts);
        addPosts(readPosts, 'start');
        setIsFetchingNewer(false);
        setIsLoading(false);
      } catch (e) {
        setIsFetchingNewer(false);
        setErrorFetchingNewer(e as Error);
        setIsLoading(false);
      }
    },
    [
      DEBUG_PREFIX,
      PAGE_SIZE,
      addPosts,
      appFetch,
      code,
      connectedUser,
      endpoint,
      queryParams,
    ]
  );

  /** public function to trigger fetching for older posts */
  const fetchNewer = useCallback(() => {
    if (newestPostId) {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}external fetchNewer`, newestPostId);
      _fetchNewer(newestPostId).catch((e) => {
        console.error(e);
      });
    }
  }, [DEBUG_PREFIX, _fetchNewer, newestPostId]);

  /** first data fill happens everytime a new source platform is added/removed */
  useEffect(() => {
    if (DEBUG)
      console.log(`${DEBUG_PREFIX}first fetch older with new platform added`, {
        posts,
        fetchedOlderFirst,
        connectedSourcePlatforms,
      });
    if (
      !arraysEqual(connectedSourcePlatforms, connectedSourcePlatformsInit) &&
      !isFetchingOlder
    ) {
      reset();
      setFetchedOlderFirst(true);
      if (DEBUG)
        console.log(
          `${DEBUG_PREFIX}_fetchOlder due to connectedSourcePlatforms`,
          { connectedSourcePlatforms }
        );

      _fetchOlder(undefined).catch((e) => {
        console.error(e);
      });
    }
  }, [
    DEBUG_PREFIX,
    _fetchOlder,
    connectedSourcePlatforms,
    connectedSourcePlatformsInit,
    fetchedOlderFirst,
    isFetchingOlder,
    posts,
    reset,
  ]);

  /** whenever posts have been fetched, check if we have fetched for newer posts yet, and if not, fetch for newer */
  useEffect(() => {
    if (posts && posts.length > 0 && !fetchedNewerFirst && connectedUser) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}first fetch newer`);
      _fetchNewer(posts[0].id).catch((e) => {
        console.error(e);
      });
    }
  }, [posts, fetchedNewerFirst, connectedUser, DEBUG_PREFIX, _fetchNewer]);

  /** turn off errors automatically */
  useEffect(() => {
    if (errorFetchingNewer) {
      setErrorFetchingNewer(undefined);
    }
    if (errorFetchingOlder) {
      setErrorFetchingOlder(undefined);
    }
  }, [errorFetchingNewer, errorFetchingOlder]);

  const removePost = useCallback(
    (postId: string) => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}removing post ${postId} from list`);
      setPosts((prev) =>
        prev ? prev.filter((p) => p.id !== postId) : undefined
      );
      unsubscribeCallbacks.current[postId]?.();
    },
    [DEBUG_PREFIX]
  );

  const getPost = useCallback(
    (postId: string) => {
      if (!posts) {
        return undefined;
      }

      const ix = posts.findIndex((p) => p.id === postId);
      return ix !== -1 ? posts[ix] : undefined;
    },
    [posts]
  );

  const getNextAndPrev = useCallback(
    (postId?: string) => {
      if (!posts || !postId) {
        return {};
      }

      const currPostIndex = posts?.findIndex((p) => p.id === postId);
      const prevPostId =
        posts && currPostIndex !== undefined && currPostIndex > 0
          ? posts[currPostIndex - 1].id
          : undefined;

      const nextPostId =
        posts && currPostIndex !== undefined && currPostIndex < posts.length - 1
          ? posts[currPostIndex + 1].id
          : undefined;

      return { prevPostId, nextPostId };
    },
    [posts]
  );

  const feed = useMemo(() => {
    return {
      posts,
      getPost,
      removePost,
      fetchOlder,
      isFetchingOlder,
      errorFetchingOlder,
      fetchNewer,
      isFetchingNewer,
      errorFetchingNewer,
      isLoading,
      moreToFetch,
      getNextAndPrev,
    };
  }, [
    posts,
    getPost,
    removePost,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    moreToFetch,
    getNextAndPrev,
  ]);

  return feed;
};

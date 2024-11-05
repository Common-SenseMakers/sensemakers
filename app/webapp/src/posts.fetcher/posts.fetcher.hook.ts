/* eslint-disable react-hooks/rules-of-hooks */
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
  feedNameDebug: string;
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

  const [isFetchingOlder, setIsFetchingOlder] = useState<boolean>(false);
  const [errorFetchingOlder, setErrorFetchingOlder] = useState<Error>();

  const [isFetchingNewer, setIsFetchingNewer] = useState(false);
  const [errorFetchingNewer, setErrorFetchingNewer] = useState<Error>();
  const [moreToFetch, setMoreToFetch] = useState(true);

  const [connectedSourcePlatformsInit] = useState(connectedSourcePlatforms);

  const unsubscribeCallbacks = useRef<Record<string, () => void>>({});

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  // for debug
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}usePostsFetcher mounted`);
    }
    return () => {
      mounted = false;
      if (DEBUG) console.log(`${DEBUG_PREFIX}usePostsFetcher unmounted`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setPostsCallback = (
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

    if (DEBUG) console.log(`${DEBUG_PREFIX}pushing posts`, { prev, allPosts });
    return allPosts;
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEBUG_PREFIX, onPostsAdded]
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

  const removeAllPosts = () => {
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
  };

  const reset = () => {
    if (DEBUG) console.log(`${DEBUG_PREFIX}resetting posts`);
    removeAllPosts();
    setFetchedOlderFirst(false);
    setIsLoading(true);
  };

  const _oldestPostId = useMemo(() => {
    const oldest = posts ? posts[posts.length - 1]?.id : undefined;
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX}recomputing oldest _oldestPostId ${oldest || ''}`
      );
    return oldest;
  }, [DEBUG_PREFIX, posts]);

  /** fetch for more post backwards, receives an optional oldestPostId and is updated when the queryParameters change */
  const fetchOlderCallback = useCallback(
    async (oldestPostId?: string) => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching for older`, {
          oldestPostId,
          connectedUser,
          code,
        });
      if (!connectedUser || code) {
        return;
      }

      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching for older`, {
          oldestPostId,
        });

      try {
        const params: PostsQuery = {
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
          ...queryParams,
        };
        if (DEBUG) console.log(`${DEBUG_PREFIX}fetching for older`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG)
          console.log(`${DEBUG_PREFIX}fetching for older retrieved`, readPosts);
        addPosts(readPosts, 'end');
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
        });
        setErrorFetchingOlder(e as Error);
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedUser, code, queryParams, endpoint]
  );

  const _fetchOlder = (oldestPostId?: string) => {
    setIsFetchingOlder(true);
    fetchOlderCallback(oldestPostId)
      .then(() => {
        setIsFetchingOlder(false);
      })
      .catch(console.error);
  };

  /** public function to trigger fetching for older posts since the current oldest one */
  const fetchOlder = useCallback(() => {
    if (DEBUG) console.log(`${DEBUG_PREFIX}external fetchOlder`, _oldestPostId);
    _fetchOlder(_oldestPostId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_oldestPostId]);

  /** reset at every status change  */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX}resetting and _fetchOlder due to status, labels, keywords, endpoint change`,
        {
          queryParams,
          endpoint,
          fetchedOlderFirst,
        }
      );
    reset();
    setIsFetchingOlder(true);
    fetchOlderCallback(undefined).catch((e) => {
      console.error(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedUser, queryParams, endpoint]);

  const newestPostId = useMemo(() => {
    const newest = posts ? posts[0]?.id : undefined;
    if (DEBUG)
      console.log(`${DEBUG_PREFIX}recomputing newestPostId ${newest || ''}`);
    return newest;
  }, [DEBUG_PREFIX, posts]);

  const fetchNewerCallback = useCallback(
    async (_newestPostId: string) => {
      if (!connectedUser || !_newestPostId || code) {
        return;
      }

      if (DEBUG) console.log(`${DEBUG_PREFIX}fetching for newer`);
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
        setIsLoading(false);
      } catch (e) {
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

  const _fetchNewer = (_newestPostId: string) => {
    setIsFetchingNewer(true);
    fetchNewerCallback(_newestPostId)
      .then(() => {
        setIsFetchingNewer(false);
      })
      .catch(console.error);
  };

  /** public function to trigger fetching for older posts */
  const fetchNewer = useCallback(() => {
    if (newestPostId) {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}external fetchNewer`, newestPostId);
      _fetchNewer(newestPostId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEBUG_PREFIX, newestPostId]);

  /** first data fill happens everytime a new source platform is added/removed */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX} checking first fetch older with new platform added`,
        {
          posts,
          fetchedOlderFirst,
          connectedSourcePlatforms,
        }
      );
    if (
      !arraysEqual(connectedSourcePlatforms, connectedSourcePlatformsInit) &&
      !isFetchingOlder
    ) {
      if (DEBUG)
        console.log(
          `${DEBUG_PREFIX} resetting and _fetchOlder due to connectedSourcePlatforms`,
          { connectedSourcePlatforms }
        );
      console.warn('skipping reset due to connectedPlatforms');
      // reset();
      // setFetchedOlderFirst(true);
      // _fetchOlder(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    DEBUG_PREFIX,
    connectedSourcePlatforms,
    connectedSourcePlatformsInit,
    fetchedOlderFirst,
    isFetchingOlder,
    posts,
  ]);

  /** whenever posts have been fetched, check if we have fetched for newer posts yet, and if not, fetch for newer */
  useEffect(() => {
    if (posts && posts.length > 0 && !fetchedNewerFirst && connectedUser) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}first fetch newer`);
      _fetchNewer(posts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, fetchedNewerFirst, connectedUser, DEBUG_PREFIX]);

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
      feedNameDebug: DEBUG_PREFIX,
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
    DEBUG_PREFIX,
  ]);

  return feed;
};

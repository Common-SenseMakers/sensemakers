/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { AppPostFull, PostsQuery } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { arraysEqual } from '../utils/general';

const DEBUG = false;

export const PAGE_SIZE = 5;

export interface PostFetcherInterface {
  feedNameDebug: string;
  posts?: AppPostFull[];
  isLoading: boolean;
  isFetchingDown: boolean;
  errorFetchingDown?: Error;
  isFetchingUp: boolean;
  errorFetchingUp?: Error;
  fetchDown: () => void;
  fetchUp: () => void;
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
  DEBUG_PREFIX?: string;
}

/**
 * Handles one array of posts by keeping track of the top and bottom post ids and
 * fething up and down posts as requested by a consuming component
 */
export const usePostsFetcher = (input: FetcherConfig): PostFetcherInterface => {
  const { connectedUser, connectedPlatforms } = useAccountContext();

  const { endpoint, queryParams, onPostsAdded } = input;

  const DEBUG_PREFIX = input.DEBUG_PREFIX || '';

  const appFetch = useAppFetch();

  const [posts, setPosts] = useState<AppPostFull[] | undefined>(undefined);
  const [fetchedDownFirst, setFetchedDownFirst] = useState(false);
  const [fetchedUpFirst, setFetchedUpFirst] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetchingDown, setIsFetchingDown] = useState<boolean>(false);
  const [errorFetchingDown, setErrorFetchingDown] = useState<Error>();

  const [isFetchingUp, setIsFetchingUp] = useState(false);
  const [errorFetchingUp, setErrorFetchingUp] = useState<Error>();
  const [moreToFetch, setMoreToFetch] = useState(true);

  const [connectedPlatformsInit] = useState(connectedPlatforms);

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

  const addPosts = useCallback(
    (candidateNewPosts: AppPostFull[], position: 'start' | 'end') => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}addPosts called`, {
          posts: candidateNewPosts,
        });

      /** add posts  */
      setPosts((prev) => {
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

        /** resort in case posts come from another platform unsorted from the current ones */

        return allPosts;
      });

      if (onPostsAdded) {
        onPostsAdded(candidateNewPosts);
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
    setFetchedDownFirst(false);
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
  const fetchDownCallback = useCallback(
    async (bottomPostId?: string) => {
      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching down`, {
          bottomPostId,
          connectedUser,
          code,
        });
      if (code) {
        return;
      }

      if (DEBUG)
        console.log(`${DEBUG_PREFIX}fetching down`, {
          bottomPostId,
        });

      try {
        const params: PostsQuery = {
          ...queryParams,
          fetchParams: {
            ...queryParams.fetchParams,
            untilId: bottomPostId,
          },
        };
        if (DEBUG) console.log(`${DEBUG_PREFIX}fetching down`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG)
          console.log(`${DEBUG_PREFIX}fetching down retrieved`, readPosts);
        addPosts(readPosts, 'end');
        setIsLoading(false);
        if (readPosts.length < params.fetchParams.expectedAmount) {
          setMoreToFetch(false);
        } else {
          setMoreToFetch(true);
        }
      } catch (e) {
        console.error(`${DEBUG_PREFIX}error fetching down`, {
          e,
        });
        setErrorFetchingDown(e as Error);
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedUser, code, queryParams, endpoint]
  );

  const _fetchDown = (bottomPostId?: string) => {
    setIsFetchingDown(true);
    fetchDownCallback(bottomPostId)
      .then(() => {
        setIsFetchingDown(false);
      })
      .catch((e) => {
        console.error(e);
        setIsFetchingDown(false);
      });
  };

  /** public function to trigger fetching for older posts since the current oldest one */
  const fetchDown = useCallback(() => {
    if (DEBUG) console.log(`${DEBUG_PREFIX}external fetchDown`, _oldestPostId);
    _fetchDown(_oldestPostId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_oldestPostId]);

  /** reset at every status change  */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX}resetting and _fetchDown due to status, labels, keywords, endpoint change`,
        {
          queryParams,
          endpoint,
          fetchedDownFirst: fetchedDownFirst,
        }
      );
    reset();
    setIsFetchingDown(true);
    fetchDownCallback(undefined)
      .then(() => {
        setIsFetchingDown(false);
      })
      .catch((e) => {
        console.error(e);
        setIsFetchingDown(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedUser, queryParams, endpoint]);

  const topPostId = useMemo(() => {
    const top = posts ? posts[0]?.id : undefined;
    if (DEBUG) console.log(`${DEBUG_PREFIX}recomputing topPostId ${top || ''}`);
    return top;
  }, [DEBUG_PREFIX, posts]);

  const fetchUpCallback = useCallback(
    async (_topPostId: string) => {
      if (!_topPostId || code) {
        return;
      }

      if (DEBUG) console.log(`${DEBUG_PREFIX}fetching up`);
      setFetchedUpFirst(true);

      try {
        const params: PostsQuery = {
          ...queryParams,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            sinceId: _topPostId,
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
        setErrorFetchingUp(e as Error);
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const _fetchUp = (_topPostId: string) => {
    setIsFetchingUp(true);
    fetchUpCallback(_topPostId)
      .then(() => {
        setIsFetchingUp(false);
      })
      .catch(console.error);
  };

  /** public function to trigger fetching for up posts */
  const fetchUp = useCallback(() => {
    if (topPostId) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}external fetchUp`, topPostId);
      _fetchUp(topPostId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEBUG_PREFIX, topPostId]);

  /** first data fill happens everytime a new source platform is added/removed */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `${DEBUG_PREFIX} checking first fetch down with new platform added`,
        {
          posts,
          fetchedDownFirst,
          connectedPlatforms,
        }
      );
    if (
      !arraysEqual(connectedPlatforms, connectedPlatformsInit) &&
      !isFetchingDown
    ) {
      if (DEBUG)
        console.log(
          `${DEBUG_PREFIX} resetting and _fetchDown due to connectedSourcePlatforms`,
          { connectedPlatforms }
        );
      // console.warn('skipping reset due to connectedPlatforms');
      // reset();
      // setFetchedOlderFirst(true);
      // _fetchOlder(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    DEBUG_PREFIX,
    connectedPlatforms,
    connectedPlatformsInit,
    fetchedDownFirst,
    isFetchingDown,
    posts,
  ]);

  /** whenever posts have been fetched, check if we have fetched for newer posts yet, and if not, fetch for newer */
  useEffect(() => {
    if (posts && posts.length > 0 && !fetchedUpFirst) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}first fetch newer`);
      _fetchUp(posts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, fetchedUpFirst, connectedUser, DEBUG_PREFIX]);

  /** turn off errors automatically */
  useEffect(() => {
    if (errorFetchingUp) {
      setErrorFetchingUp(undefined);
    }
    if (errorFetchingDown) {
      setErrorFetchingDown(undefined);
    }
  }, [errorFetchingUp, errorFetchingDown]);

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
      fetchDown,
      isFetchingDown,
      errorFetchingDown,
      fetchUp,
      isFetchingUp,
      errorFetchingUp,
      isLoading,
      moreToFetch,
      getNextAndPrev,
      feedNameDebug: DEBUG_PREFIX,
    };
  }, [
    posts,
    getPost,
    removePost,
    fetchDown,
    isFetchingDown,
    errorFetchingDown,
    fetchUp,
    isFetchingUp,
    errorFetchingUp,
    isLoading,
    moreToFetch,
    getNextAndPrev,
    DEBUG_PREFIX,
  ]);

  return feed;
};

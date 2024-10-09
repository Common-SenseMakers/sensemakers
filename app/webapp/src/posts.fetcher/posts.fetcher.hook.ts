import { connected } from 'process';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostsQuery,
  PostsQueryParams,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import {
  OverallLoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';

const DEBUG = true;

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
  status?: string;
  labels?: string[];
  keywords?: string[];
  subscribe?: boolean;
  onPostsAdded?: (posts: AppPostFull[]) => void;
  PAGE_SIZE?: number;
}

/**
 * Handles one array of posts by keeping track of the newest and oldest post ids and
 * fething newer and older posts as requested by a consuming component
 */
export const usePostsFetcher = (input: FetcherConfig): PostFetcherInterface => {
  const { connectedUser, connectedSourcePlatforms } = useAccountContext();

  const {
    endpoint,
    status,
    labels,
    keywords,
    subscribe,
    onPostsAdded,
    PAGE_SIZE: _PAGE_SIZE,
  } = input;

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

  const unsubscribeCallbacks = useRef<Record<string, () => void>>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get('code');

  const _labels = labels || [];
  const _keywords = keywords || [];

  const queryParams: PostsQueryParams = {
    status,
    keywords: _keywords,
    labels: _labels,
  };

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

        if (DEBUG) console.log(`refetch post returned`, { post, posts });

        const shouldRemove = (() => {
          if (status === PostsQueryStatus.DRAFTS) {
            return [
              AppPostRepublishedStatus.AUTO_REPUBLISHED,
              AppPostRepublishedStatus.REPUBLISHED,
            ].includes(post.republishedStatus);
          }
          if (status === PostsQueryStatus.IGNORED) {
            return post.reviewedStatus !== AppPostReviewStatus.IGNORED;
          }
          if (status === PostsQueryStatus.PENDING) {
            return post.reviewedStatus !== AppPostReviewStatus.PENDING;
          }
          if (status === PostsQueryStatus.PUBLISHED) {
            return post.republishedStatus === AppPostRepublishedStatus.PENDING;
          }
        })();

        setPosts((prev) => {
          const newPosts = prev ? [...prev] : [];
          const ix = prev ? prev.findIndex((p) => p.id === postId) : -1;

          if (DEBUG) console.log(`setPosts called`, { ix, newPosts });

          if (ix !== -1) {
            if (DEBUG) console.log(`settingPost`, { ix, shouldRemove });
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
        throw new Error(`Error fetching post ${postId}`);
      }
    },
    [posts, connectedUser, status]
  );

  const addPosts = useCallback(
    (newPosts: AppPostFull[], position: 'start' | 'end') => {
      if (DEBUG) console.log(`addPosts called`, { posts: newPosts });

      /** add posts  */
      setPosts((prev) => {
        const allPosts =
          position === 'end'
            ? prev
              ? prev.concat(newPosts)
              : newPosts
            : prev
              ? newPosts.reverse().concat(prev)
              : newPosts;

        if (DEBUG) console.log(`pushing posts`, { prev, allPosts });
        return allPosts;
      });

      /** subscribe to updates */
      newPosts.forEach((post) => {
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

        if (subscribe) {
          const unsubscribe = subscribeToUpdates(`post-${post.id}`, () => {
            if (DEBUG) console.log(`update detected`, post.id);
            refetchPost(post.id);
          });

          if (DEBUG)
            console.log(
              `unsubscribefor post ${post.id} stored on unsubscribeCallbacks`
            );
          unsubscribeCallbacks.current[post.id] = unsubscribe;
        }
      });

      if (onPostsAdded) {
        onPostsAdded(newPosts);
      }
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

  /** first data fill happens everytime a new source platform is added/removed */
  useEffect(() => {
    if (DEBUG)
      console.log('first fetch older with new platform added', {
        posts,
        fetchedOlderFirst,
        connectedSourcePlatforms,
      });
    if (connectedSourcePlatforms.length > 0) {
      reset();
      setFetchedOlderFirst(true);
      _fetchOlder(undefined);
    }
  }, [connectedSourcePlatforms]);

  /** whenever posts have been fetched, check if we have fetched for newer posts yet, and if not, fetch for newer */
  useEffect(() => {
    if (posts && posts.length > 0 && !fetchedNewerFirst && connectedUser) {
      if (DEBUG) console.log('first fetch newer');
      _fetchNewer(posts[0].id);
    }
  }, [posts, fetchedNewerFirst]);

  const reset = () => {
    if (DEBUG) console.log('resetting posts');
    removeAllPosts();
    setFetchedOlderFirst(false);
    setIsLoading(true);
  };

  /** reset at every status change  */
  useEffect(() => {
    reset();
    _fetchOlder(undefined);
  }, [status, labels, keywords, endpoint]);

  const _oldestPostId = useMemo(() => {
    const oldest = posts ? posts[posts.length - 1]?.id : undefined;
    if (DEBUG) console.log(`recomputing oldest _oldestPostId ${oldest}`);
    return oldest;
  }, [posts]);

  /** fetch for more post backwards */
  const _fetchOlder = useCallback(
    async (oldestPostId?: string) => {
      if (DEBUG)
        console.log(`fetching for older`, {
          oldestPostId,
          connectedUser,
          isFetchingOlder,
          code,
        });
      if (!connectedUser || isFetchingOlder || code) {
        return;
      }

      if (DEBUG)
        console.log(`fetching for older`, {
          oldestPostId,
          isFetchingOlder,
          fetchedOlderFirst,
        });
      setIsFetchingOlder(true);

      try {
        const params: PostsQuery = {
          ...queryParams,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for older - twitter`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG) console.log(`fetching for older retrieved`, readPosts);
        addPosts(readPosts, 'end');
        setIsFetchingOlder(false);
        setIsLoading(false);
        if (readPosts.length < params.fetchParams.expectedAmount) {
          setMoreToFetch(false);
        } else {
          setMoreToFetch(true);
        }
      } catch (e: any) {
        console.error(`error fetching older`, { e, isFetchingOlder });
        setIsFetchingOlder(false);
        setErrorFetchingOlder(e);
        setIsLoading(false);
      }
    },
    [appFetch, status, connectedUser, isFetchingOlder, queryParams]
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
      if (!connectedUser || !_newestPostId || code) {
        return;
      }

      if (DEBUG) console.log(`fetching for newer`);
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
        if (DEBUG) console.log(`fetching for newer`, params);
        const readPosts = await appFetch<AppPostFull[], PostsQuery>(
          endpoint,
          params
        );

        if (DEBUG) console.log(`fetching for newer retrieved`, readPosts);
        addPosts(readPosts, 'start');
        setIsFetchingNewer(false);
        setIsLoading(false);
      } catch (e: any) {
        setIsFetchingNewer(false);
        setErrorFetchingNewer(e);
        setIsLoading(false);
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
    setPosts((prev) =>
      prev ? prev.filter((p) => p.id !== postId) : undefined
    );
    unsubscribeCallbacks.current[postId]?.();
  };

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
        posts && currPostIndex != undefined && currPostIndex > 0
          ? posts[currPostIndex - 1].id
          : undefined;

      const nextPostId =
        posts && currPostIndex != undefined && currPostIndex < posts.length - 1
          ? posts[currPostIndex + 1].id
          : undefined;

      return { prevPostId, nextPostId };
    },
    [posts]
  );

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
};

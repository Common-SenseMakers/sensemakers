import { connected } from 'process';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatus,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useQueryFilter } from './query.filter.hook';

const PAGE_SIZE = 5;

const DEBUG = true;

export const usePostsFetch = () => {
  const { connectedUser, twitterProfile, mastodonProfile, blueskyProfile } =
    useAccountContext();

  const appFetch = useAppFetch();
  const { status } = useQueryFilter();

  const [posts, setPosts] = useState<AppPostFull[]>([]);
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
          const newPosts = [...prev];
          const ix = prev.findIndex((p) => p.id === postId);

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
          position === 'end' ? prev.concat(newPosts) : newPosts.concat(prev);
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
    if (
      posts.length === 0 &&
      !fetchedOlderFirst &&
      (twitterProfile || mastodonProfile || blueskyProfile)
    ) {
      if (DEBUG) console.log('first fetch older');
      _fetchOlder(undefined);
    }
  }, [posts, fetchedOlderFirst, connectedUser]);

  useEffect(() => {
    if (posts.length > 0 && twitterProfile && mastodonProfile) {
      if (DEBUG) console.log('first fetch older with new platform added');
      reset();
      _fetchOlder(undefined);
    }
  }, [connectedUser]);

  /** whenever posts have been fetched, check if we have fetched for newer posts yet, and if not, fetch for newer */
  useEffect(() => {
    if (posts.length !== 0 && !fetchedNewerFirst && connectedUser) {
      if (DEBUG) console.log('first fetch newer');
      _fetchNewer(posts[0].id);
    }
  }, [posts]);

  const reset = () => {
    if (DEBUG) console.log('resetting posts');
    removeAllPosts();
    setFetchedOlderFirst(false);
    setIsLoading(true);
  };

  const checkPostRemove = useCallback(() => {
    const found = posts.find((p) => p.id === 'to-remove');
  }, [posts]);

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
      setFetchedOlderFirst(true);
      try {
        const params: UserPostsQuery = {
          status,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for older - twitter`, params);
        const readPosts = await appFetch<AppPostFull[], UserPostsQuery>(
          '/api/posts/getOfUser',
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
    [appFetch, status, connectedUser, isFetchingOlder]
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
    isLoading,
    status,
    moreToFetch,
  };
};

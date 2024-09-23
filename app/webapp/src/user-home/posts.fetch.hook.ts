import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import {
  AppPostFull,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostsQueryStatus,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

const PAGE_SIZE = 5;

const DEBUG = false;

export const usePostsFetcher = (
  endpoint: string,
  stauts: PostsQueryStatus,
  onPostsAdded: (posts: AppPostFull[]) => void,
  onRemovePost: (postId: string) => void,
  onRemoveAll: () => void
) => {
  const { connectedUser, twitterProfile } = useAccountContext();

  const appFetch = useAppFetch();

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const [fetchedOlderFirst, setFetchedOlderFirst] = useState(false);
  const [fetchedNewerFirst, setFetchedNewerFirst] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [errorFetchingOlder, setErrorFetchingOlder] = useState<Error>();
,
  const [isFetchingNewer, setIsFetchingNewer] = useState(false);
  const [errorFetchingNewer, setErrorFetchingNewer] = useState<Error>();
  const [moreToFetch, setMoreToFetch] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get('code');

  /** refetch a post and overwrite its value in the array */
  

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

      onPostsAdded(newPosts);
    },
    [appFetch]
  );

  const removeAllPosts = () => {
    onRemoveAll();
    
    /** reset the array */
    if (DEBUG) console.log(`settings pots to empty array`);
    setPosts([]);
  };

  /** first data fill happens everytime the posts are empty and the firstFetched is false */
  useEffect(() => {
    if (posts.length === 0 && !fetchedOlderFirst && twitterProfile) {
      if (DEBUG) console.log('first fetch older');
      _fetchOlder(undefined);
    }
  }, [posts, fetchedOlderFirst, connectedUser]);

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
    onRemovePost(postId);
  };

  

  return {
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
  };
};

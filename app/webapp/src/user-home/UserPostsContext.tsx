import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  PostUpdate,
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

interface PostContextType {
  posts?: AppPostFull[];
  isFetching: boolean;
  error?: Error;
  fetchOlder: () => void;
  filterStatus: PostsQueryStatusParam;
  updatePost: (postId: string, postUpdate: PostUpdate) => Promise<void>;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

const PAGE_SIZE = 5;

const DEBUG = true;

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const [fetchedFirst, setFetchedFirst] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorFetching, setErrorFetching] = useState<Error>();

  const unsubscribeCallbacks = useRef<Record<string, () => void>>({});

  const [status, setStatus] = useState<PostsQueryStatusParam>(
    PostsQueryStatusParam.ALL
  );

  const location = useLocation();

  console.log({ posts });

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
    (posts: AppPostFull[]) => {
      if (DEBUG) console.log(`addPosts called`, { posts });

      /** add posts  */
      setPosts((prev) => {
        const allPosts = prev.concat(posts);
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

  /** listen to the URL and set the filter status based on it */
  useEffect(() => {
    if (
      Object.values(PostsQueryStatusParam)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      if (DEBUG) console.log('changing status based on location');
      setStatus(location.pathname.slice(1) as PostsQueryStatusParam);
    }
  }, [location]);

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
      setIsFetching(true);
      setFetchedFirst(true);
      try {
        const params: UserPostsQueryParams = {
          status,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for older`, params);
        const readPosts = await appFetch<AppPostFull[], UserPostsQueryParams>(
          '/api/posts/getOfUser',
          params
        );

        if (DEBUG) console.log(`fetching for older retrieved`, readPosts);
        addPosts(readPosts);
        setIsFetching(false);
      } catch (e: any) {
        setIsFetching(false);
        setErrorFetching(e);
      }
    },
    [appFetch, status, connectedUser]
  );

  /** public function to trigger fetching for older posts */
  const fetchOlder = useCallback(() => {
    if (DEBUG) console.log(`external fetchOlder`, _oldestPostId);
    _fetchOlder(_oldestPostId);
  }, [_fetchOlder, _oldestPostId]);

  const updatePost = async (postId: string, postUpdate: PostUpdate) => {
    if (DEBUG) console.log(`updatePost called`, { postId, postUpdate });
    await appFetch<
      void,
      {
        postId: string;
        postUpdate: PostUpdate;
      }
    >('/api/posts/update', {
      postId,
      postUpdate,
    });
  };

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isFetching,
        error: errorFetching,
        fetchOlder,
        filterStatus: status,
        updatePost,
      }}>
      {children}
    </UserPostsContextValue.Provider>
  );
};

export const useUserPosts = () => {
  const context = useContext(UserPostsContextValue);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

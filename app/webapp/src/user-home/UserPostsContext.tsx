import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import {
  AppPostFull,
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

interface PostContextType {
  posts?: AppPostFull[];
  isFetching: boolean;
  error?: Error;
  fetchOlder: () => void;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

const PAGE_SIZE = 5;

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const [fetchedFirst, setFetchedFirst] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorFetching, setErrorFetching] = useState<Error>();

  const [status, setStatus] = useState<PostsQueryStatusParam>(
    PostsQueryStatusParam.ALL
  );

  const location = useLocation();

  /** first data fill happens everytime the posts are empty and the firstFetched is false */
  useEffect(() => {
    if (posts.length === 0 && !fetchedFirst && connectedUser) {
      _fetchOlder(undefined);
    }
  }, [posts, fetchedFirst, connectedUser]);

  const reset = () => {
    setPosts([]);
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
      setStatus(location.pathname.slice(1) as PostsQueryStatusParam);
    }
  }, [location]);

  const _oldestPostId = useMemo(() => {
    return posts ? posts[posts.length - 1]?.id : undefined;
  }, [posts]);

  /** fetch for more post backwards */
  const _fetchOlder = useCallback(
    async (oldestPostId?: string) => {
      if (!connectedUser) {
        return;
      }

      setIsFetching(true);
      setFetchedFirst(true);
      try {
        const readPosts = await appFetch<AppPostFull[], UserPostsQueryParams>(
          '/api/posts/getOfUser',
          {
            status,
            fetchParams: {
              expectedAmount: PAGE_SIZE,
              untilId: oldestPostId,
            },
          }
        );

        setPosts((prev) => prev.concat(readPosts));
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
    _fetchOlder(_oldestPostId);
  }, [_fetchOlder, _oldestPostId]);

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isFetching,
        error: errorFetching,
        fetchOlder,
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

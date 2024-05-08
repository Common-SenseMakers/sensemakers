import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { createContext } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { useToastContext } from '../app/ToastsContext';
import {
  AppPostFull,
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

interface PostContextType {
  posts?: AppPostFull[];
  more: () => void;
  isLoading: boolean;
  error: Error | null;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  const [filter, setFilter] = useState<UserPostsQueryParams>({
    status: PostsQueryStatusParam.ALL,
    fetchParams: { expectedAmount: 10 },
  });

  const location = useLocation();

  console.log({ location });

  useEffect(() => {
    if (
      Object.values(PostsQueryStatusParam)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      setFilter({
        status: location.pathname.slice(1) as PostsQueryStatusParam,
        fetchParams: { expectedAmount: 10 },
      });
    }
  }, [location]);

  /** always refetch for a connected user and filter combination */
  const {
    data: _posts,
    error: errorGetting,
    isFetching: isGetting,
  } = useQuery({
    queryKey: ['getUserPosts', connectedUser, filter],
    queryFn: async () => {
      if (connectedUser) {
        const posts = await appFetch<AppPostFull[], UserPostsQueryParams>(
          '/api/posts/getOfUser',
          filter
        );

        return posts;
      }
      return null;
    },
  });

  /** convert null to undefined */
  const posts = _posts !== null ? _posts : undefined;

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isLoading: isGetting,
        error: errorGetting,
        more: () => {},
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

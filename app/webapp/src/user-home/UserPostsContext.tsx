import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { useToastContext } from '../app/ToastsContext';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

interface PostContextType {
  posts?: AppPostFull[];
  isLoading: boolean;
  error: Error | null;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { show } = useToastContext();
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  /** everytime the connected user changes, trigger a fetch */
  const {
    isSuccess: fetched,
    isFetching: isFetching,
    error: errorFetching,
  } = useQuery({
    queryKey: ['fetchUserPosts', connectedUser?.userId],
    queryFn: () => {
      if (connectedUser) {
        return appFetch('/api/posts/fetch', {
          userId: connectedUser.userId,
        });
      }
      return null;
    },
  });

  /** once fetched, get the posts */
  const {
    data: _posts,
    error: errorGetting,
    isFetching: isGetting,
  } = useQuery({
    queryKey: ['getUserPosts', connectedUser],
    queryFn: async () => {
      if (connectedUser) {
        const posts = await appFetch<AppPostFull[]>(
          '/api/posts/getOfUser',
          {
            userId: connectedUser.userId,
          },
          queryParams
        );

        return posts;
      }
      return null;
    },
    enabled: fetched,
  });

  /** convert null to undefined */
  const posts = _posts !== null ? _posts : undefined;

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isLoading: isFetching || isGetting,
        error: errorFetching || errorGetting,
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

import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect } from 'react';
import { createContext } from 'react';

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

  useEffect(() => {
    if (errorFetching) {
      console.error(errorFetching);
      show({ message: errorFetching.message, status: 'critical' });
    }
  }, [errorFetching]);

  /** once fetched, get the posts */
  const {
    data: _posts,
    error,
    isFetching: isGetting,
  } = useQuery({
    queryKey: ['getUserPosts', connectedUser],
    queryFn: () => {
      if (connectedUser) {
        return appFetch<AppPostFull[]>('/api/posts/getOfUser', {
          userId: connectedUser.userId,
        });
      }
      return null;
    },
    enabled: fetched,
  });

  /** convert null to undefined */
  const posts = _posts !== null ? _posts : undefined;

  return (
    <UserPostsContextValue.Provider
      value={{ posts, isLoading: isFetching || isGetting, error: error }}>
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

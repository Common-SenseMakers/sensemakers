import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { createContext } from 'react';

import { useAppFetch } from '../api/app.fetch';
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
  const { connectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  /** everytime the connected user changes, trigger a fetch */
  const {
    refetch: refetchFetch,
    isSuccess: fetched,
    isFetching: isFetching,
  } = useQuery({
    queryKey: ['fetchUserPosts', connectedUser],
    queryFn: () => {
      if (connectedUser) {
        return appFetch('/app/posts/fetch', {
          userId: connectedUser.userId,
        });
      }
      return null;
    },
  });

  /** once fetched, get the posts */
  const {
    data: _posts,
    refetch: refetchGet,
    error,
    isFetching: isGetting,
    isSuccess: gotPosts,
  } = useQuery({
    queryKey: ['getUserPosts', connectedUser],
    queryFn: () => {
      if (connectedUser) {
        return appFetch<AppPostFull[]>('/app/posts/getOfUser', {
          userId: connectedUser.userId,
        });
      }
      return null;
    },
    enabled: fetched,
  });

  console.log({ _posts, error, fetched });

  /** once post got, trigger parse */
  const { refetch: refetchTriggerParse } = useQuery({
    queryKey: ['parseUserPosts', connectedUser],
    queryFn: () => {
      if (connectedUser) {
        return appFetch('/app/posts/triggerParse', {
          userId: connectedUser.userId,
        });
      }
      return null;
    },
    enabled: gotPosts,
  });

  /** triggering of each post parse is done in the PostContext */

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

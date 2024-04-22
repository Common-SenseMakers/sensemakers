import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { createContext } from 'react';

import { getUserPosts } from '../api/post.requests';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

interface PostContextType {
  posts?: AppPostFull[];
  refetch: () => void;
  error: Error | null;
  isFetching: boolean;
}

export const UserPostsContext = createContext<PostContextType | undefined>(
  undefined
);

const UserPostsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const userId = 'some-user-id';
  const { token } = useAccountContext();

  const {
    data: _posts,
    refetch,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['userPosts', userId, token],
    queryFn: () => {
      if (token) {
        return getUserPosts(userId, token);
      }
      return null;
    },
  });

  /** convert null to undefined */
  const posts = _posts !== null ? _posts : undefined;

  return (
    <UserPostsContext.Provider value={{ posts, refetch, error, isFetching }}>
      {children}
    </UserPostsContext.Provider>
  );
};

export const useUserPosts = () => {
  const context = useContext(UserPostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

export default UserPostsProvider;

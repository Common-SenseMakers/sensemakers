import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useReducer } from 'react';
import { createContext } from 'react';

import { getUserPosts } from '../api/post.requests';
import { useAccountContext } from '../user/contexts/AccountContext';

interface PostContextType {}
const UserPostsContext = createContext<PostContextType | undefined>(undefined);

export { UserPostsContext };

const UserPostsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const userId = 'some-user-id';
  const { token } = useAccountContext();

  const { data: posts } = useQuery({
    queryKey: ['userPosts', userId, token],
    queryFn: () => {
      if (token) {
        return getUserPosts(userId, token);
      }
      return null;
    },
  });

  return (
    <UserPostsContext.Provider value={{ posts }}>
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

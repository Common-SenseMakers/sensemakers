import React, { createContext, useContext, useEffect, useState } from 'react';

import { firestoreService } from '../services/firestore.service';
import { AppPost } from '../shared/types/types.posts';

interface UserPostsContextType {
  userPosts: AppPost[];
  fetchUserPosts: () => void;
}

const UserPostsContext = createContext<UserPostsContextType | undefined>(
  undefined
);

export const useUserPosts = () => useContext(UserPostsContext);

export const UserPostsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userPosts, setUserPosts] = useState<AppPost[]>([]);

  const fetchUserPosts = async () => {
    try {
      const userPosts = await firestoreService.getUserPosts('');
      setUserPosts(userPosts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  return (
    <UserPostsContext.Provider value={{ userPosts, fetchUserPosts }}>
      {children}
    </UserPostsContext.Provider>
  );
};

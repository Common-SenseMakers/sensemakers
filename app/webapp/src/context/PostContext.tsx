import React, { createContext, useContext, useEffect, useState } from 'react';

import { subscribeToPost } from '../services/realtime.listener';
import { AppPost } from '../shared/types/types.posts';

interface PostContextType {
  post: AppPost | undefined;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => useContext(PostContext);

export const PostProvider: React.FC<{
  children: React.ReactNode;
  postId: string;
}> = ({ children, postId }) => {
  const [post, setPost] = useState<AppPost>();

  useEffect(() => {
    const unsubscribe = subscribeToPost(postId, setPost);
    return () => unsubscribe();
  }, []);

  return (
    <PostContext.Provider value={{ post }}>{children}</PostContext.Provider>
  );
};

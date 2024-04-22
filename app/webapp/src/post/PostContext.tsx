import React, { createContext, useContext, useEffect, useState } from 'react';

import { subscribeToPost } from '../firestore/realtime.listener';
import { AppPostFull } from '../shared/types/types.posts';

interface PostContextType {
  post: AppPostFull | undefined;
}

const PostContextValue = createContext<PostContextType | undefined>(undefined);

export const PostContext: React.FC<{
  children: React.ReactNode;
  postInit?: AppPostFull;
  postId?: string;
}> = ({ children, postInit, postId: _postId }) => {
  if (_postId === undefined && postInit === undefined) {
    throw new Error(`Both postId and post were undefined`);
  }

  if (postInit !== undefined && postInit !== undefined) {
    throw new Error(`Both postId and post were defined. Define only one`);
  }

  const [post, setPost] = useState<AppPostFull | undefined>(postInit);
  const postId = _postId ? _postId : (postInit as unknown as AppPostFull).id;

  useEffect(() => {
    const unsubscribe = subscribeToPost(postId, setPost);
    return () => unsubscribe();
  }, []);

  return (
    <PostContextValue.Provider value={{ post }}>
      {children}
    </PostContextValue.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContextValue);
  if (!context) {
    throw new Error('must be used within a Context');
  }
  return context;
};

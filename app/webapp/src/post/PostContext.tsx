import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useMemo } from 'react';

import { getPost } from '../api/post.requests';
import { subscribeToPost } from '../firestore/realtime.listener';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';

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

  if (postInit !== undefined && _postId !== undefined) {
    throw new Error(`Both postId and post were defined. Define only one`);
  }

  const { token } = useAccountContext();

  const postId = useMemo(
    () => (_postId ? _postId : (postInit as unknown as AppPostFull).id),
    [_postId, postInit]
  );

  /** if postInit not provided get post from the DB */
  const { data: post, refetch } = useQuery({
    queryKey: ['postId'],
    queryFn: () => {
      if (postId && token) {
        return getPost(postId, token);
      }
    },
  });

  /**
   * subscribe to real time updates of this post and trigger a refetch everytime
   * one is received*/
  useEffect(() => {
    const unsubscribe = subscribeToPost(postId, refetch);
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

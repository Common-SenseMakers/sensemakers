import React, { createContext, useContext } from 'react';

import { AppPostFull } from '../../shared/types/types.posts';
import { useAccountContext } from '../../user-login/contexts/AccountContext';
import { PostDerivedContext, usePostDerived } from './use.post.derived';
import { PostFetchContext, usePostFetch } from './use.post.fetch';
import { PostUpdateContext, usePostUpdate } from './use.post.update';

interface PostContextType {
  fetched: PostFetchContext;
  derived: PostDerivedContext;
  updated: PostUpdateContext;
}

const PostContextValue = createContext<PostContextType | undefined>(undefined);

export const PostContext: React.FC<{
  children: React.ReactNode;
  postInit?: AppPostFull;
  postId?: string;
  showCelebration?: boolean;
}> = ({ children, postInit, postId: _postId, showCelebration }) => {
  if (_postId === undefined && postInit === undefined) {
    throw new Error(`Both postId and post were undefined`);
  }

  const { connectedUser } = useAccountContext();

  const fetched = usePostFetch(connectedUser, _postId, postInit);
  const derived = usePostDerived(fetched);
  const updated = usePostUpdate(fetched, derived, postInit, connectedUser);

  return (
    <PostContextValue.Provider
      value={{
        fetched,
        derived,
        updated,
      }}>
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

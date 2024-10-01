import React, { createContext, useContext, useMemo } from 'react';

import { AppPostFull } from '../../shared/types/types.posts';
import { useAccountContext } from '../../user-login/contexts/AccountContext';
import { PostPublishStatusModals } from '../PostPublishStatusModals';
import { PostDerivedContext, usePostDerived } from './use.post.derived';
import { PostFetchContext, usePostFetch } from './use.post.fetch';
import { PostNavContext, usePostNav } from './use.post.nav';
import { PostPublishContext, usePostPublish } from './use.post.publish';
import { PostUpdateContext, usePostUpdate } from './use.post.update';

interface PostContextType {
  fetched: PostFetchContext;
  derived: PostDerivedContext;
  updated: PostUpdateContext;
  publish: PostPublishContext;
  navigatePost: PostNavContext;
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
  const derived = usePostDerived(fetched, connectedUser);
  const updated = usePostUpdate(fetched, derived, postInit, connectedUser);
  const publish = usePostPublish(fetched, updated);
  const navigatePost = usePostNav(fetched);

  return (
    <PostContextValue.Provider
      value={{
        fetched,
        derived,
        updated,
        publish,
        navigatePost,
      }}>
      <PostPublishStatusModals
        showCelebration={showCelebration}></PostPublishStatusModals>
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

import React, { createContext, useContext, useMemo } from 'react';

import { AppPostFull } from '../../shared/types/types.posts';
import { useAccountContext } from '../../user-login/contexts/AccountContext';
import { PostPublishStatusModals } from '../PostPublishStatusModals';
import { PostDerivedContext, usePostDerived } from './use.post.derived';
import { PostFetchContext, usePostFetch } from './use.post.fetch';
import { PostMergeContext, usePostMerge } from './use.post.merge';
import { PostNavContext, usePostNav } from './use.post.nav';
import { PostPublishContext, usePostPublish } from './use.post.publish';
import { PostUpdateContext, usePostUpdate } from './use.post.update';

const DEBUG = false;

interface PostContextType {
  fetched: PostFetchContext;
  derived: PostDerivedContext;
  update: PostUpdateContext;
  merged: PostMergeContext;
  publish: PostPublishContext;
  navigatePost: PostNavContext;
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

  const { connectedUser } = useAccountContext();

  const fetched = usePostFetch(connectedUser, _postId, postInit);
  const derived = usePostDerived(fetched, connectedUser);
  const update = usePostUpdate(fetched, derived, connectedUser);
  const merged = usePostMerge(fetched, update, postInit);
  const publish = usePostPublish(merged, update);
  const navigatePost = usePostNav(fetched);

  return (
    <PostContextValue.Provider
      value={{
        fetched,
        derived,
        update,
        merged,
        publish,
        navigatePost,
      }}>
      <PostPublishStatusModals></PostPublishStatusModals>
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

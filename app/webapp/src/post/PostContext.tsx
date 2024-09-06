import React, { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AbsoluteRoutes } from '../route.names';
import { PublishPostPayload } from '../shared/types/types.fetch';
import {
  PlatformPostDraftApproval,
  PlatformPostSignerType,
} from '../shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostRepublishedStatus,
  UnpublishPlatformPostPayload,
} from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PostPublishStatusModals } from './PostPublishStatusModals';
import { CurrentPostContext, useCurrentPost } from './use.current.post';
import { PostNavContext, usePostNav } from './use.post.nav';
import { PostPublishContext, usePostPublish } from './use.post.publish';
import { PostUpdateContext, usePostUpdate } from './use.post.update';

const DEBUG = false;

interface PostContextType {
  current: CurrentPostContext;
  update: PostUpdateContext;
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

  const current = useCurrentPost(connectedUser, _postId, postInit);
  const update = usePostUpdate(current, connectedUser);
  const publish = usePostPublish(current, update);
  const navigatePost = usePostNav(current);

  /** the post is the combination of the postFetched and the edited */
  const post = useMemo<AppPostFull | undefined>(() => {
    if (current.isLoading) return postInit;
    if (current.post && current.post !== null) {
      return { ...current.post, ...update.postEdited };
    }
    return undefined;
  }, [current.post, postInit, update.postEdited, current.isLoading]);

  return (
    <PostContextValue.Provider
      value={{
        current,
        update,
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

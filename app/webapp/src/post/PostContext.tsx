import init, { Nanopub } from '@nanopub/sign';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToPost } from '../firestore/realtime.listener';
import { PLATFORM } from '../shared/types/types';
import { PlatformPostDraft } from '../shared/types/types.platform.posts';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { getAccount } from '../user-login/user.helper';

interface NanopubInfo {
  uri: string;
}

interface PostContextType {
  post: AppPostFull | undefined;
  nanopubDraft: PlatformPostDraft | undefined;
  nanopubPublished: NanopubInfo | undefined;
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

  const { connectedUser } = useAccountContext();

  const appFetch = useAppFetch();

  const postId = useMemo(
    () => (_postId ? _postId : (postInit as unknown as AppPostFull).id),
    [_postId, postInit]
  );

  /** if postInit not provided get post from the DB */
  const { data: _post, refetch } = useQuery({
    queryKey: ['postId', postId, connectedUser],
    queryFn: () => {
      if (postId && connectedUser) {
        return appFetch<AppPostFull>('/api/posts/get', { postId });
      }
    },
  });

  const post = _post !== null ? _post : undefined;

  /**
   * subscribe to real time updates of this post and trigger a refetch everytime
   * one is received*/
  useEffect(() => {
    const unsubscribe = subscribeToPost(postId, refetch);
    return () => unsubscribe();
  }, []);

  /** derive nanopub details from current post */
  const { data: nanopubPublished } = useQuery({
    queryKey: ['nanopub', post],
    queryFn: async () => {
      try {
        await (init as any)();
        const nanopub = post?.mirrors.find(
          (m) => m.platformId === PLATFORM.Nanopub
        );
        if (!nanopub || !nanopub.posted) return undefined;

        const nanopubObj = new Nanopub(nanopub.posted.post);
        return nanopubObj.info();
      } catch (e) {
        console.error(e);
      }
    },
  });

  const nanopubDraft = useMemo(() => {
    const nanopub = post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    return nanopub.draft;
  }, [post]);

  /** create drafts if connected user has account and draft for that platform does
   * not exists */
  useEffect(() => {
    const nanopubAccount = getAccount(connectedUser, PLATFORM.Nanopub);
    if (nanopubAccount && !nanopubDraft) {
      /** if draft not available, create it */
      appFetch('/api/posts/createDraft', { postId });
    }
  }, [post, connectedUser]);

  return (
    <PostContextValue.Provider value={{ post, nanopubPublished, nanopubDraft }}>
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

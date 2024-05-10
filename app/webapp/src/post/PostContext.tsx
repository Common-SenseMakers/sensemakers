import init, { Nanopub } from '@nanopub/sign';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { TweetV2 } from 'twitter-api-v2';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import { AppUserRead, PLATFORM } from '../shared/types/types';
import {
  PlatformPost,
  PlatformPostDraft,
} from '../shared/types/types.platform.posts';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { getAccount } from '../user-login/user.helper';

const DEBUG = true;

interface NanopubInfo {
  uri: string;
}

interface PostContextType {
  post: AppPostFull | undefined;
  author: AppUserRead;
  reparse: () => void;
  isParsing: boolean;
  nanopubDraft: PlatformPostDraft | undefined;
  nanopubPublished: NanopubInfo | undefined;
  tweet?: PlatformPost<TweetV2>;
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
    () => (_postId ? _postId : (postInit as AppPostFull).id),
    [_postId, postInit]
  );

  /** if postInit not provided get post from the DB */
  const {
    data: _post,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['postId', postId, connectedUser],
    queryFn: () => {
      try {
        if (postId && connectedUser) {
          return appFetch<AppPostFull>('/api/posts/get', { postId });
        }
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
      }
    },
  });

  const post = isLoading ? postInit : _post !== null ? _post : undefined;

  /**
   * subscribe to real time updates of this post and trigger a refetch everytime
   * one is received*/
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(`post-${postId}`, refetch);
    return () => {
      if (DEBUG) console.log('unsubscribing to updates post', postId);
      unsubscribe();
    };
  }, []);

  /**
   * subscribe to real time updates of this post platform posts */
  useEffect(() => {
    if (post && post.mirrors) {
      const unsubscribes = post.mirrors.map((m) => {
        return {
          unsubscribe: subscribeToUpdates(`platformPost-${m.id}`, refetch),
          platformPostId: m.id,
        };
      });

      return () => {
        unsubscribes.forEach((unsubscribe) => {
          if (DEBUG)
            console.log(
              'unsubscribing to updates platformPost',
              unsubscribe.platformPostId
            );
          unsubscribe.unsubscribe();
        });
      };
    }
  }, [post]);

  const [_isReparsing, setIsReparsing] = React.useState(false);

  const reparse = async () => {
    try {
      setIsReparsing(true);
      await appFetch('/api/posts/parse', { postId: post?.id });
      setIsReparsing(false);
    } catch (e: any) {
      setIsReparsing(false);
      console.error(e);
      throw new Error(e);
    }
  };

  const isParsing = _isReparsing || post?.parsingStatus === 'processing';

  /** derive nanopub details from current post */
  const { data: nanopubPublished } = useQuery({
    queryKey: ['nanopub', post],
    queryFn: async () => {
      try {
        await (init as any)();
        const nanopub = post?.mirrors.find(
          (m) => m.platformId === PLATFORM.Nanopub
        );
        if (!nanopub || !nanopub.posted) return null;

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

  /** TODO: The post author needs not be the connected user. We can probably have an
   * endpoint to get user profiles by userIds */
  const author: AppUserRead = {
    userId: '1234',
    twitter: [
      {
        user_id: '1234',
        read: true,
        write: true,
        profile: {
          id: '1234',
          name: 'SenseNet Bot',
          username: 'sense_nets_bot',
          profile_image_url:
            'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
        },
      },
    ],
  };

  const tweet = post?.mirrors.find((m) => m.platformId === PLATFORM.Twitter);

  return (
    <PostContextValue.Provider
      value={{
        post,
        author,
        tweet,
        nanopubPublished,
        nanopubDraft,
        reparse,
        isParsing,
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

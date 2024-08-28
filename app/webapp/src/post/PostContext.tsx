import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import { NotificationFreq } from '../shared/types/types.notifications';
import { PlatformPost, PlatformPostDraft } from '../shared/types/types.platform.posts';
import { AppPostFull, AppPostReviewStatus, PostUpdate, PostUpdatePayload, PostsQueryStatus } from '../shared/types/types.posts';
import { TwitterThread } from '../shared/types/types.twitter';
import { AppUserRead, AutopostOption, PLATFORM } from '../shared/types/types.user';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { getAccount } from '../user-login/user.helper';
import { AppPostStatus, getPostStatuses } from './posts.helper';
import { usePostActions } from './PostActionsContext';

const DEBUG = false;

interface PostContextType {
  postId?: string;
  post: AppPostFull | undefined;
  author: AppUserRead;
  reparse: () => void;
  nanopubDraft: PlatformPostDraft | undefined;
  tweet?: PlatformPost<TwitterThread>;
  editable: boolean;
  enabledEdit: boolean;
  setEnabledEdit: (enabled: boolean) => void;
  updateSemantics: (newSemantics: string) => Promise<void>;
  postStatuses: AppPostStatus;
  updatePost: (update: PostUpdate) => Promise<void>;
  prevPostId?: string;
  nextPostId?: string;
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
  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>(undefined);
  const [enabledEdit, setEnabledEdit] = useState<boolean>(false);
  const [requestedDraft, setRequestedDraft] = useState(false);

  const { filterStatus, removePost, getNextAndPrev } = useUserPosts();
  const appFetch = useAppFetch();
  const { approveOrUpdate, ignore, retractNanopublication } = usePostActions();

  const postId = useMemo(() => (_postId ? _postId : (postInit as AppPostFull).id), [_postId, postInit]);

  const { data: postFetched, refetch, isLoading } = useQuery({
    queryKey: ['postId', postId, connectedUser],
    queryFn: () => {
      try {
        if (postId) {
          return appFetch<AppPostFull>('/api/posts/get', { postId });
        }
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
      }
    },
  });

  const post = useMemo<AppPostFull | undefined>(() => {
    if (isLoading) return postInit;
    if (postFetched && postFetched !== null) {
      return { ...postFetched, ...postEdited };
    }
    return undefined;
  }, [postFetched, postInit, postEdited]);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates(`post-${postId}`, refetch);
    return () => {
      if (DEBUG) console.log('unsubscribing to updates post', postId);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (post && post.mirrors) {
      const unsubscribes = post.mirrors.map((m) => ({
        unsubscribe: subscribeToUpdates(`platformPost-${m.id}`, refetch),
        platformPostId: m.id,
      }));

      return () => {
        unsubscribes.forEach((unsubscribe) => {
          if (DEBUG) console.log('unsubscribing to updates platformPost', unsubscribe.platformPostId);
          unsubscribe.unsubscribe();
        });
      };
    }
  }, [post]);

  useEffect(() => {
    if (postFetched) {
      setPostEdited(undefined);
    }
  }, [postFetched]);

  const reparse = async () => {
    try {
      await appFetch('/api/posts/parse', { postId: post?.id });
    } catch (e: any) {
      console.error(e);
      throw new Error(e);
    }
  };

  const nanopubDraft = useMemo(() => {
    const nanopub = post?.mirrors?.find((m) => m.platformId === PLATFORM.Nanopub);
    return nanopub ? nanopub.draft : undefined;
  }, [post]);

  useEffect(() => {
    const nanopubAccount = getAccount(connectedUser, PLATFORM.Nanopub);
    if (nanopubAccount && !nanopubDraft && !requestedDraft) {
      setRequestedDraft(true);
      appFetch('/api/posts/createDraft', { postId }).then(() => {
        setRequestedDraft(false);
      });
    }
  }, [post, connectedUser]);

  const author: AppUserRead = {
    userId: '1234',
    signupDate: 1720702932,
    settings: {
      notificationFreq: NotificationFreq.None,
      autopost: {
        [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL },
      },
    },
    twitter: [
      {
        user_id: '1234',
        read: true,
        write: true,
        profile: {
          id: '1234',
          name: 'SenseNet Bot',
          username: 'sense_nets_bot',
          profile_image_url: 'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
        },
      },
    ],
  };

  const tweet = post?.mirrors?.find((m) => m.platformId === PLATFORM.Twitter);

  const updatePost = async (update: PostUpdate) => {
    const statusKept = (() => {
      if (filterStatus === PostsQueryStatus.ALL) return true;
      if (filterStatus === PostsQueryStatus.PENDING) return update.reviewedStatus === AppPostReviewStatus.PENDING;
      if (filterStatus === PostsQueryStatus.PUBLISHED) return update.reviewedStatus === AppPostReviewStatus.APPROVED;
      if (filterStatus === PostsQueryStatus.IGNORED) return update.reviewedStatus === AppPostReviewStatus.IGNORED;
    })();

    if (!statusKept) {
      removePost(postId);
    }

    try {
      await appFetch<void, PostUpdatePayload>('/api/posts/update', {
        postId: post!.id,
        postUpdate: update,
      });
    } catch (e: any) {
      console.error(e);
      throw new Error(e);
    }
  };

  const updateSemantics = (newSemantics: string) =>
    updatePost({
      reviewedStatus: AppPostReviewStatus.DRAFT,
      semantics: newSemantics,
    });

  const postStatuses = useMemo(() => getPostStatuses(post), [post]);

  const editable = connectedUser && connectedUser.userId === post?.authorId && (!postStatuses.live || enabledEdit);

  const { prevPostId, nextPostId } = useMemo(() => getNextAndPrev(post?.id), [post, getNextAndPrev]);

  return (
    <PostContextValue.Provider
      value={{
        postId,
        post,
        postStatuses,
        author,
        tweet,
        nanopubDraft,
        reparse,
        updateSemantics,
        updatePost,
        editable: editable !== undefined ? editable : false,
        setEnabledEdit,
        enabledEdit,
        prevPostId,
        nextPostId,
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
import React, { createContext, useContext, useState } from 'react';
import { useAppFetch } from '../api/app.fetch';
import { useToastContext } from '../app/ToastsContext';
import { AppPostFull, AppPostReviewStatus, PostUpdate } from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PlatformPostSignerType, PlatformPostDraftApproval } from '../shared/types/types.platform.posts';

interface PostActionsContextType {
  approveOrUpdate: (posts: AppPostFull[]) => Promise<void>;
  ignore: (posts: AppPostFull[]) => Promise<void>;
  retractNanopublication: (posts: AppPostFull[]) => Promise<void>;
  isUpdating: boolean;
  isRetracting: boolean;
  errorMessage?: string;
}

const PostActionsContext = createContext<PostActionsContextType | undefined>(undefined);

export const PostActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRetracting, setIsRetracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const appFetch = useAppFetch();
  const { show } = useToastContext();
  const { signNanopublication } = useNanopubContext();

  const approveOrUpdate = async (posts: AppPostFull[]) => {
    setIsUpdating(true);
    setErrorMessage(undefined);
    try {
      await Promise.all(posts.map(async (post) => {
        const nanopub = post.mirrors.find((m) => m.platformId === PLATFORM.Nanopub);
        if (!nanopub || !nanopub.draft) {
          throw new Error(`Unexpected nanopub mirror not found for post ${post.id}`);
        }

        if (nanopub.draft.signerType === PlatformPostSignerType.USER) {
          if (!signNanopublication) {
            throw new Error(`Unexpected signNanopublication undefined`);
          }
          const signed = await signNanopublication(nanopub.draft.unsignedPost);
          nanopub.draft.signedPost = signed.rdf();
        }

        nanopub.draft.postApproval = PlatformPostDraftApproval.APPROVED;

        await appFetch('/api/posts/approve', {
          post: {
            ...post,
            mirrors: post.mirrors.map(m => m.platformId === PLATFORM.Nanopub ? nanopub : m),
          },
          platformIds: [PLATFORM.Nanopub],
        });
      }));
    } catch (e: any) {
      setErrorMessage(e.message);
      show({ title: 'Error approving posts', message: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const ignore = async (posts: AppPostFull[]) => {
    setIsUpdating(true);
    setErrorMessage(undefined);
    try {
      await Promise.all(posts.map(post => 
        appFetch('/api/posts/update', {
          postId: post.id,
          postUpdate: { reviewedStatus: AppPostReviewStatus.IGNORED } as PostUpdate,
        })
      ));
    } catch (e: any) {
      setErrorMessage(e.message);
      show({ title: 'Error ignoring posts', message: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const retractNanopublication = async (posts: AppPostFull[]) => {
    setIsRetracting(true);
    setErrorMessage(undefined);
    try {
      await Promise.all(posts.map(async (post) => {
        const nanopub = post.mirrors.find((m) => m.platformId === PLATFORM.Nanopub);
        if (!nanopub || !nanopub.post_id) {
          throw new Error(`Unexpected nanopub mirror not found for post ${post.id}`);
        }

        if (!nanopub.deleteDraft) {
          throw new Error(`Delete draft not available for post ${post.id}`);
        }

        if (nanopub.deleteDraft.signerType === PlatformPostSignerType.USER) {
          if (!signNanopublication) {
            throw new Error(`Unexpected signNanopublication undefined`);
          }
          const signed = await signNanopublication(nanopub.deleteDraft.unsignedPost);
          nanopub.deleteDraft.signedPost = signed.rdf();
        }

        nanopub.deleteDraft.postApproval = PlatformPostDraftApproval.APPROVED;

        await appFetch('/api/posts/unpublish', {
          post_id: nanopub.post_id,
          platformId: PLATFORM.Nanopub,
          postId: post.id,
        });
      }));
    } catch (e: any) {
      setErrorMessage(e.message);
      show({ title: 'Error retracting nanopublications', message: e.message });
    } finally {
      setIsRetracting(false);
    }
  };

  return (
    <PostActionsContext.Provider value={{
      approveOrUpdate,
      ignore,
      retractNanopublication,
      isUpdating,
      isRetracting,
      errorMessage,
    }}>
      {children}
    </PostActionsContext.Provider>
  );
};

export const usePostActions = () => {
  const context = useContext(PostActionsContext);
  if (!context) {
    throw new Error('usePostActions must be used within a PostActionsProvider');
  }
  return context;
};

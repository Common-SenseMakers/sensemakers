import { useQuery } from '@tanstack/react-query';
import { use } from 'i18next';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useAppFetch } from '../api/app.fetch';
import { useToastContext } from '../app/ToastsContext';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import { PublishPostPayload } from '../shared/types/types.fetch';
import { NotificationFreq } from '../shared/types/types.notifications';
import {
  PlatformPost,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostSignerType,
} from '../shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostUpdatePayload,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import { TwitterThread } from '../shared/types/types.twitter';
import {
  AppUserRead,
  AutopostOption,
  PLATFORM,
} from '../shared/types/types.user';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { getAccount } from '../user-login/user.helper';
import { AppPostStatus, usePostStatuses } from './usePostStatuses';

const DEBUG = false;

interface PostContextType {
  post: AppPostFull | undefined;
  author: AppUserRead;
  reparse: () => void;
  nanopubDraft: PlatformPostDraft | undefined;
  tweet?: PlatformPost<TwitterThread>;
  editable: boolean; // can be true if not published
  enabledEdit: boolean; // only true if editing after publishing
  setEnabledEdit: (enabled: boolean) => void;
  updateSemantics: (newSemantics: string) => Promise<void>;
  postStatuses: AppPostStatus;
  updatePost: (update: PostUpdate) => Promise<void>;
  isUpdating: boolean;
  approveOrUpdate: () => Promise<void>;
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

  const { show } = useToastContext();
  const { connectedUser } = useAccountContext();
  const [postEdited, setPostEdited] = React.useState<AppPostFull | undefined>(
    undefined
  );
  const [enabledEdit, setEnabledEdit] = React.useState<boolean>(false);

  const [requesteDraft, setRequestedDraft] = React.useState(false);

  const { filterStatus, removePost } = useUserPosts();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const appFetch = useAppFetch();

  const postId = useMemo(
    () => (_postId ? _postId : (postInit as AppPostFull).id),
    [_postId, postInit]
  );

  /** if postInit not provided get post from the DB */
  const {
    data: postFetched,
    refetch,
    isLoading,
  } = useQuery({
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

  /** the post is the combination of the postFetched and the edited */
  const post = useMemo<AppPostFull | undefined>(() => {
    if (isLoading) return postInit;
    if (postFetched && postFetched !== null) {
      setIsUpdating(false);
      return { ...postFetched, ...postEdited };
    }
    return undefined;
  }, [postFetched, postInit, postEdited]);

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

  useEffect(() => {
    if (postFetched) {
      setPostEdited(undefined);
    }
  }, [postFetched]);

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

  const nanopubDraft = useMemo(() => {
    const nanopub = post?.mirrors?.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    return nanopub.draft;
  }, [post]);

  /** create drafts if connected user has account and draft for that platform does
   * not exists */
  useEffect(() => {
    const nanopubAccount = getAccount(connectedUser, PLATFORM.Nanopub);
    if (nanopubAccount && !nanopubDraft && !requesteDraft) {
      /** if draft not available, create it */
      setRequestedDraft(true);
      appFetch('/api/posts/createDraft', { postId }).then(() => {
        setRequestedDraft(false);
      });
    }
  }, [post, connectedUser]);

  /** TODO: This is a placeholder. The post author may not be the connected user. We can probably have an
   * endpoint to get user profiles by userIds */
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
          profile_image_url:
            'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
        },
      },
    ],
  };

  const tweet = post?.mirrors?.find((m) => m.platformId === PLATFORM.Twitter);

  /** actuall call to update the post in the backend */
  const _updatePost = async (update: PostUpdate) => {
    if (!post) {
      return;
    }

    setIsUpdating(true);
    try {
      await appFetch<void, PostUpdatePayload>('/api/posts/update', {
        postId: post.id,
        postUpdate: update,
      });
      // setIsUpdating(false); let the refetch set the udpate flow to false
    } catch (e: any) {
      console.error(e);
      show({ title: 'Error updating post', message: e.message });
      setIsUpdating(false);
    }
  };

  /** updatePost and optimistically update the post object */
  const optimisticUpdate = useCallback(
    async (update: PostUpdate) => {
      if (!post) {
        return;
      }

      setPostEdited({ ...post, ...update });
      _updatePost(update);
    },
    [post]
  );

  const updateSemantics = (newSemantics: string) =>
    optimisticUpdate({
      reviewedStatus: AppPostReviewStatus.DRAFT,
      semantics: newSemantics,
    });

  /** updatePost and optimistically update the posts lists */
  const updatePost = async (update: PostUpdate) => {
    /** optimistic remove the post from the filtered list */
    const statusKept = (() => {
      if (filterStatus === PostsQueryStatus.ALL) {
        return true;
      }
      if (filterStatus === PostsQueryStatus.PENDING) {
        return update.reviewedStatus === AppPostReviewStatus.PENDING;
      }
      if (filterStatus === PostsQueryStatus.PUBLISHED) {
        return update.reviewedStatus === AppPostReviewStatus.APPROVED;
      }
      if (filterStatus === PostsQueryStatus.IGNORED) {
        return update.reviewedStatus === AppPostReviewStatus.IGNORED;
      }
    })();

    if (!statusKept) {
      removePost(postId);
    }

    _updatePost(update);
  };

  const postStatuses = usePostStatuses(post);

  const { signNanopublication } = useNanopubContext();

  const approveOrUpdate = async () => {
    // mark nanopub draft as approved
    setIsUpdating(true);
    const nanopub = post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.draft) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }

    if (nanopub.draft.signerType === PlatformPostSignerType.USER) {
      if (!signNanopublication) {
        throw new Error(`Unexpected signNanopublication undefined`);
      }

      const signed = await signNanopublication(nanopub.draft.unsignedPost);
      nanopub.draft.signedPost = signed.rdf();
    }

    /** approve is set the first time a post is published (should be set
     * also set in the backend anyway) */
    if (post && post.republishedStatus === AppPostRepublishedStatus.PENDING) {
      nanopub.draft.postApproval = PlatformPostDraftApproval.APPROVED;
    }

    if (post) {
      await appFetch<void, PublishPostPayload>('/api/posts/approve', {
        post,
        platformIds: [PLATFORM.Nanopub],
      });
    }

    setEnabledEdit(false);

    // setIsUpdating(false); should be set by the re-fetch flow
  };

  const editable =
    connectedUser &&
    connectedUser.userId === post?.authorId &&
    (!postStatuses.published || enabledEdit);

  return (
    <PostContextValue.Provider
      value={{
        post,
        postStatuses,
        author,
        tweet,
        nanopubDraft,
        reparse,
        updateSemantics,
        updatePost,
        isUpdating,
        approveOrUpdate,
        editable: editable !== undefined ? editable : false,
        setEnabledEdit,
        enabledEdit,
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

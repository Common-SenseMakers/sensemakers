import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../../api/app.fetch';
import { useToastContext } from '../../app/ToastsContext';
import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
  PostUpdatePayload,
  PostsQueryStatus,
} from '../../shared/types/types.posts';
import { AppUserRead } from '../../shared/types/types.user';
import { useUserPosts } from '../../user-home/UserPostsContext';
import { AppPostStatus, getPostStatuses } from '../posts.helper';
import { PostDerivedContext } from './use.post.derived';
import { PostFetchContext } from './use.post.fetch';

export interface PostUpdateContext {
  editable: boolean; // can be true if not published
  enabledEdit: boolean; // only true if editing after publishing
  postEdited: AppPostFull | undefined;
  postMerged?: AppPostFull;
  statusesMerged: AppPostStatus;
  setEnabledEdit: (enabled: boolean) => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
  updateSemantics: (newSemantics: string) => Promise<void>;
  updatePost: (update: PostUpdate) => Promise<void>;
}

export const usePostUpdate = (
  fetched: PostFetchContext,
  derived: PostDerivedContext,
  postInit?: AppPostFull,
  connectedUser?: AppUserRead
): PostUpdateContext => {
  const { show } = useToastContext();
  const appFetch = useAppFetch();

  const { filterStatus, removePost } = useUserPosts();

  const [enabledEdit, setEnabledEdit] = useState<boolean>(false);
  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>(
    undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const editable =
    connectedUser !== undefined &&
    connectedUser.userId === fetched.post?.authorId &&
    (!derived.statuses.live || enabledEdit);

  useEffect(() => {
    if (fetched.post) {
      setPostEdited(undefined);
      setIsUpdating(false);
    }
  }, [fetched.post]);

  /** actuall call to update the post in the backend */
  const _updatePost = async (update: PostUpdate) => {
    if (!fetched.post) {
      return;
    }

    setIsUpdating(true);
    try {
      await appFetch<void, PostUpdatePayload>('/api/posts/update', {
        postId: fetched.post.id,
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
      if (!fetched.post) {
        return;
      }

      setPostEdited({ ...fetched.post, ...update });
      updatePost(update);
    },
    [fetched.post]
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
      if (filterStatus === PostsQueryStatus.DRAFTS) {
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

    if (!statusKept && fetched.postId) {
      removePost(fetched.postId);
    }

    _updatePost(update);
  };

  /** combine edited and fetched posts to get the current local version of a post */
  const postMerged = useMemo<AppPostFull | undefined>(() => {
    if (fetched.isLoading) return postInit;
    if (fetched.post && fetched.post !== null) {
      return { ...fetched.post, ...postEdited };
    }
    return undefined;
  }, [fetched.post, postInit, postEdited, fetched.isLoading]);

  const statusesMerged = useMemo(() => {
    return getPostStatuses(postMerged);
  }, [postMerged]);

  return {
    editable,
    enabledEdit,
    postEdited,
    postMerged,
    statusesMerged,
    setEnabledEdit,
    isUpdating,
    setIsUpdating,
    updateSemantics,
    updatePost: optimisticUpdate,
  };
};

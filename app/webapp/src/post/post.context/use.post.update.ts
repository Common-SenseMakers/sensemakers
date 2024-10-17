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
import { ConnectedUser } from '../../user-login/contexts/AccountContext';
import { useNanopubContext } from '../../user-login/contexts/platforms/nanopubs/NanopubContext';
import { AppPostStatus, getPostStatuses } from '../posts.helper';
import { PostDerivedContext } from './use.post.derived';
import { PostFetchContext } from './use.post.fetch';
import { usePostMergeDeltas } from './use.post.merge.deltas';

const DEBUG = false;

export interface PostUpdateContext {
  editable: boolean; // can be true if not published
  enabledEdit: boolean; // only true if editing after publishing
  postEdited: AppPostFull | undefined;
  postMerged?: AppPostFull;
  statusesMerged: AppPostStatus;
  setEnabledEdit: (enabled: boolean) => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
  updateSemantics: (newSemantics: string) => void;
  updatePost: (update: PostUpdate) => Promise<void>;
  readyToNanopublish: boolean;
  inPrePublish: boolean;
}

export const usePostUpdate = (
  fetched: PostFetchContext,
  derived: PostDerivedContext,
  postInit?: AppPostFull,
  connectedUser?: ConnectedUser
): PostUpdateContext => {
  const { show } = useToastContext();
  const appFetch = useAppFetch();

  const { filterStatus, feed } = useUserPosts();
  const { removePost } = feed;

  const [enabledEdit, setEnabledEdit] = useState<boolean>(false);
  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>(
    undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const { mergedSemantics, updateSemantics: updateSemanticsLocal } =
    usePostMergeDeltas(fetched);

  const editable =
    connectedUser !== undefined &&
    connectedUser.userId === fetched.post?.authorUserId &&
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

  const updateSemantics = (newSemantics: string) => {
    updateSemanticsLocal(newSemantics);
    updatePost({
      semantics: newSemantics,
      reviewedStatus: AppPostReviewStatus.DRAFT,
    });
  };

  /**
   * combine edited and fetched posts to get the current local version of a post
   * semantics are merged independently in the usePostMergeDeltas hook
   */
  const postMerged = useMemo<AppPostFull | undefined>(() => {
    if (DEBUG)
      console.log('updating postMerged', {
        fetchedIsLoading: fetched.isLoading,
        fetchedPost: fetched.post,
        postInit,
        postEdited,
        mergedSemantics,
      });
    if (fetched.isLoading) return postInit;
    if (fetched.post && fetched.post !== null) {
      return {
        ...fetched.post,
        ...postEdited,
        semantics: mergedSemantics,
      };
    }
    return undefined;
  }, [
    fetched.postId,
    fetched.post,
    postInit,
    postEdited,
    fetched.isLoading,
    mergedSemantics,
  ]);

  const statusesMerged = useMemo(() => {
    return getPostStatuses(postMerged);
  }, [postMerged]);

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.profiles?.nanopub &&
    signNanopublication &&
    derived.nanopubDraft;

  const readyToNanopublish =
    canPublishNanopub && derived.nanopubDraft && !statusesMerged.live;

  const inPrePublish = !statusesMerged.live && !statusesMerged.ignored;

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
    readyToNanopublish:
      readyToNanopublish !== undefined ? readyToNanopublish : false,
    inPrePublish,
  };
};

import { DataFactory } from 'n3';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../../api/app.fetch';
import { useToastContext } from '../../app/ToastsContext';
import {
  AppPostEditStatus,
  AppPostFull,
  PostUpdate,
  PostUpdatePayload,
} from '../../shared/types/types.posts';
import { getNode } from '../../shared/utils/n3.utils';
import { useUserPosts } from '../../user-home/UserPostsContext';
import { ConnectedUser } from '../../user-login/contexts/AccountContext';
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
  addTriple: (triple: string[]) => void;
  removeTriple: (triple: string[]) => void;
  updatePost: (update: PostUpdate) => void;
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

  const { feed } = useUserPosts();
  const { removePost } = feed;

  const [enabledEdit, setEnabledEdit] = useState<boolean>(false);
  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>(
    undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    mergedSemantics,
    updateSemantics: updateSemanticsLocal,
    addQuad,
    removeQuad,
  } = usePostMergeDeltas(fetched);

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
  const _updatePost = useCallback(
    async (update: PostUpdate) => {
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
      } catch (e) {
        console.error(e);
        show({ title: 'Error updating post', message: (e as Error).message });
        setIsUpdating(false);
      }
    },
    [appFetch, fetched.post, show]
  );

  /** updatePost and optimistically update the posts lists */
  const updatePost = useCallback(
    async (update: PostUpdate) => {
      /** optimistic remove the post from the filtered list */
      const statusKept = (() => {
        return true;
      })();

      if (!statusKept && fetched.postId) {
        removePost(fetched.postId);
      }

      await _updatePost(update);
    },
    [_updatePost, fetched.postId, removePost]
  );

  /** updatePost and optimistically update the post object */
  const optimisticUpdate = useCallback(
    (update: PostUpdate) => {
      if (!fetched.post) {
        return;
      }

      setPostEdited({ ...fetched.post, ...update });
      updatePost(update).catch(console.error);
    },
    [fetched.post, updatePost]
  );

  const updateSemantics = (newSemantics: string) => {
    updateSemanticsLocal(newSemantics);
    updatePost({
      semantics: newSemantics,
      editStatus: AppPostEditStatus.DRAFT,
    }).catch(console.error);
  };

  const addTriple = (triple: string[]) => {
    const [subject, predicate, object, defaultGraph] = triple;

    addQuad(
      DataFactory.quad(
        DataFactory.namedNode(subject),
        DataFactory.namedNode(predicate),
        getNode(object),
        DataFactory.namedNode(defaultGraph) || DataFactory.defaultGraph()
      )
    );
  };

  const removeTriple = (triple: string[]) => {
    const [subject, predicate, object, defaultGraph] = triple;

    removeQuad(
      DataFactory.quad(
        DataFactory.namedNode(subject),
        DataFactory.namedNode(predicate),
        getNode(object),
        DataFactory.namedNode(defaultGraph) || DataFactory.defaultGraph()
      )
    );
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
  }, [fetched.post, postInit, postEdited, fetched.isLoading, mergedSemantics]);

  const statusesMerged = useMemo(() => {
    return getPostStatuses(postMerged);
  }, [postMerged]);

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
    addTriple,
    removeTriple,
    readyToNanopublish: false,
    inPrePublish,
  };
};

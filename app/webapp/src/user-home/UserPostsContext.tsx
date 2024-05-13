import React, { useCallback, useContext } from 'react';
import { createContext } from 'react';

import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import { usePostsFetch } from './usePostsFetch';
import { useQueryFilter } from './useQueryFilter';
import { usePostUpdate } from './useUpdatePost';

interface PostContextType {
  posts?: AppPostFull[];
  isLoading: boolean;
  isFetchingOlder: boolean;
  errorFetchingOlder?: Error;
  isFetchingNewer: boolean;
  errorFetchingNewer?: Error;
  fetchOlder: () => void;
  fetchNewer: () => void;
  updatePost: (postId: string, postUpdate: PostUpdate) => Promise<void>;
  isPostUpdating: (postId: string) => boolean;
  filterStatus: PostsQueryStatus;
  getPost: (postId: string) => AppPostFull | undefined;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    posts,
    removePost,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
  } = usePostsFetch();

  const { updatePost: _updatePost, isPostUpdating } = usePostUpdate();

  const { status } = useQueryFilter();

  const updatePost = (postId: string, postUpdate: PostUpdate) => {
    /** If the updated post no longer matches the status filter, remove it from the list and unsubscribe it  */
    if (
      !(() => {
        if (status === PostsQueryStatus.ALL) {
          return true;
        }
        if (status === PostsQueryStatus.PENDING) {
          return postUpdate.reviewedStatus === AppPostReviewStatus.PENDING;
        }
        if (status === PostsQueryStatus.PUBLISHED) {
          return postUpdate.reviewedStatus === AppPostReviewStatus.APPROVED;
        }
        if (status === PostsQueryStatus.IGNORED) {
          return postUpdate.reviewedStatus === AppPostReviewStatus.IGNORED;
        }
      })()
    ) {
      removePost(postId);
    }
    return _updatePost(postId, postUpdate);
  };

  const getPost = useCallback(
    (postId: string) => {
      const ix = posts.findIndex((p) => p.id === postId);
      return ix !== -1 ? posts[ix] : undefined;
    },
    [posts]
  );

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isLoading,
        isFetchingOlder: isFetchingOlder,
        errorFetchingOlder: errorFetchingOlder,
        isFetchingNewer: isFetchingNewer,
        errorFetchingNewer: errorFetchingNewer,
        fetchNewer,
        fetchOlder,
        updatePost,
        isPostUpdating,
        filterStatus: status,
        getPost,
      }}>
      {children}
    </UserPostsContextValue.Provider>
  );
};

export const useUserPosts = () => {
  const context = useContext(UserPostsContextValue);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

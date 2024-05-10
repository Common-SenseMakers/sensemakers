import React, { useContext } from 'react';
import { createContext } from 'react';

import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatusParam,
} from '../shared/types/types.posts';
import { usePostsFetch } from './usePostsFetch';
import { useQueryFilter } from './useQueryFilter';
import { usePostUpdate } from './useUpdatePost';

interface PostContextType {
  posts?: AppPostFull[];
  isFetching: boolean;
  error?: Error;
  fetchOlder: () => void;
  updatePost: (postId: string, postUpdate: PostUpdate) => Promise<void>;
  isPostUpdating: (postId: string) => boolean;
  filterStatus: PostsQueryStatusParam;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { posts, removePost, isFetching, errorFetching, fetchOlder } =
    usePostsFetch();
  const { updatePost, isPostUpdating } = usePostUpdate();
  const { status } = useQueryFilter();

  console.log({ posts });

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isFetching,
        error: errorFetching,
        fetchOlder,
        updatePost: (postId: string, postUpdate: PostUpdate) => {
          /** If the updated post no longer matches the status filter, remove it from the list and unsubscribe it  */
          if (
            !(() => {
              if (status === PostsQueryStatusParam.ALL) {
                return true;
              }
              if (status === PostsQueryStatusParam.PENDING) {
                return (
                  postUpdate.reviewedStatus === AppPostReviewStatus.PENDING
                );
              }
              if (status === PostsQueryStatusParam.PUBLISHED) {
                return (
                  postUpdate.reviewedStatus === AppPostReviewStatus.APPROVED
                );
              }
              if (status === PostsQueryStatusParam.IGNORED) {
                return (
                  postUpdate.reviewedStatus === AppPostReviewStatus.IGNORED
                );
              }
            })()
          ) {
            removePost(postId);
          }
          return updatePost(postId, postUpdate);
        },
        isPostUpdating,
        filterStatus: status,
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

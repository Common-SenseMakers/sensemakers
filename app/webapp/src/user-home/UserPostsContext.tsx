import React, { useContext } from 'react';
import { createContext } from 'react';

import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import { usePostsFetch } from './posts.fetch.hook';
import { useQueryFilter } from './query.filter.hook';
import { usePostUpdate } from './update.post.hook';

interface PostContextType {
  posts?: AppPostFull[];
  isFetchingOlder: boolean;
  errorFetchingOlder?: Error;
  isFetchingNewer: boolean;
  errorFetchingNewer?: Error;
  fetchOlder: () => void;
  fetchNewer: () => void;
  updatePost: (postId: string, postUpdate: PostUpdate) => Promise<void>;
  isPostUpdating: (postId: string) => boolean;
  filterStatus: PostsQueryStatus;
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

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isFetchingOlder: isFetchingOlder,
        errorFetchingOlder: errorFetchingOlder,
        isFetchingNewer: isFetchingNewer,
        errorFetchingNewer: errorFetchingNewer,
        fetchNewer,
        fetchOlder,
        updatePost,
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

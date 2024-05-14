import React, { useCallback, useContext } from 'react';
import { createContext } from 'react';

import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatus,
} from '../shared/types/types.posts';
import { usePostsFetch } from './usePostsFetch';

interface PostContextType {
  posts?: AppPostFull[];
  isLoading: boolean;
  isFetchingOlder: boolean;
  errorFetchingOlder?: Error;
  isFetchingNewer: boolean;
  errorFetchingNewer?: Error;
  fetchOlder: () => void;
  fetchNewer: () => void;
  filterStatus: PostsQueryStatus;
  getPost: (postId: string) => AppPostFull | undefined;
  removePost: (postId: string) => void;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    posts,
    fetchOlder,
    isFetchingOlder,
    errorFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    status,
    removePost,
  } = usePostsFetch();

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
        filterStatus: status,
        getPost,
        removePost,
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

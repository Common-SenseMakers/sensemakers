import React, { useCallback, useContext } from 'react';
import { createContext } from 'react';

import { AppPostFull, PostsQueryStatus } from '../shared/types/types.posts';
import { usePostsFetch } from './posts.fetch.hook';

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
  moreToFetch: boolean;
  getNextAndPrev: (postId?: string) => {
    prevPostId?: string;
    nextPostId?: string;
  };
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
    moreToFetch,
  } = usePostsFetch();

  const getPost = useCallback(
    (postId: string) => {
      const ix = posts.findIndex((p) => p.id === postId);
      return ix !== -1 ? posts[ix] : undefined;
    },
    [posts]
  );

  const getNextAndPrev = (postId?: string) => {
    if (!posts || !postId) {
      return {};
    }

    const currPostIndex = posts?.findIndex((p) => p.id === postId);
    const prevPostId =
      posts && currPostIndex != undefined && currPostIndex > 0
        ? posts[currPostIndex - 1].id
        : undefined;

    const nextPostId =
      posts && currPostIndex != undefined && currPostIndex < posts.length - 1
        ? posts[currPostIndex + 1].id
        : undefined;

    return { prevPostId, nextPostId };
  };

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
        moreToFetch,
        getNextAndPrev,
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

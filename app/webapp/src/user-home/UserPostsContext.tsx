import React, { useCallback, useContext, createContext } from 'react';
import { AppPostFull, PostsQueryStatus } from '../shared/types/types.posts';
import { usePostsFetch } from './posts.fetch.hook';

interface UserPostsContextType {
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

const UserPostsContextValue = createContext<UserPostsContextType | undefined>(undefined);

export const UserPostsContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    (postId: string) => posts?.find((p) => p.id === postId),
    [posts]
  );

  const getNextAndPrev = useCallback(
    (postId?: string) => {
      if (!posts || !postId) {
        return {};
      }

      const currPostIndex = posts.findIndex((p) => p.id === postId);
      const prevPostId = currPostIndex > 0 ? posts[currPostIndex - 1].id : undefined;
      const nextPostId = currPostIndex < posts.length - 1 ? posts[currPostIndex + 1].id : undefined;

      return { prevPostId, nextPostId };
    },
    [posts]
  );

  return (
    <UserPostsContextValue.Provider
      value={{
        posts,
        isLoading,
        isFetchingOlder,
        errorFetchingOlder,
        isFetchingNewer,
        errorFetchingNewer,
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
    throw new Error('useUserPosts must be used within a UserPostsContext');
  }
  return context;
};

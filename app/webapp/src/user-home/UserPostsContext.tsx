import React, { useCallback, useContext, useMemo } from 'react';
import { createContext } from 'react';

import { useAppFetch } from '../api/app.fetch';
import {
  FetcherConfig,
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  PostsQuery,
} from '../shared/types/types.posts';

export enum PostsQueryStatus {
  ALL = 'all',
  IGNORED = 'ignored',
  IS_SCIENCE = 'science',
}
interface PostContextType {
  filterStatus: PostsQueryStatus;
  feed: PostFetcherInterface;
}

export const UserPostsContextValue = createContext<PostContextType | undefined>(
  undefined
);

/**
 * wraps the usePostsFetcher around the filter status and serves
 * the returned posts to lower level components as useUserPosts()
 */
export const UserPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const appFetch = useAppFetch();

  /** status is derived from location
   * set the filter status based on it.
   * It then converts into topics, which is
   * what the backend understands*/
  const { queryParams, status } = useMemo((): {
    queryParams: PostsQuery;
    status: PostsQueryStatus;
  } => {
    return { queryParams: {}, status: PostsQueryStatus.ALL };
  }, []);

  const onPostsAdded = useCallback((newPosts: AppPostFull[]) => {
    /** trigger parse if not parsed and not parsing */
    newPosts.forEach((post) => {
      if (
        post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsingStatus !== AppPostParsingStatus.PROCESSING
      ) {
        // async trigger parse
        // console.warn(`skipping triggering reparsing of post ${post.id}`);
        appFetch(`/api/posts/parse`, { postId: post.id }).catch(console.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/posts/getOfUser',
      queryParams,
      subscribe: true,
      onPostsAdded,
      DEBUG_PREFIX: '[USER POSTS] ',
    };
  }, [onPostsAdded, queryParams]);

  const feed = usePostsFetcher(config);

  return (
    <UserPostsContextValue.Provider
      value={{
        filterStatus: status,
        feed,
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

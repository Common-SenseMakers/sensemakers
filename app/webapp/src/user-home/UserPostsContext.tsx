import React, { useCallback, useContext, useMemo } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

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
import {
  NOT_SCIENCE_TOPIC_URI,
  SCIENCE_TOPIC_URI,
} from '../shared/utils/semantics.helper';

const DEBUG = false;

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
  const location = useLocation();

  /** status is derived from location
   * set the filter status based on it.
   * It then converts into topics, which is
   * what the backend understands*/
  const { queryParams, status } = useMemo((): {
    queryParams: PostsQuery;
    status: PostsQueryStatus;
  } => {
    if (
      Object.values(PostsQueryStatus)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      const newStatus = location.pathname.slice(1) as PostsQueryStatus;
      if (DEBUG)
        console.log(`changing status based on location to ${newStatus}`);
      if (newStatus === PostsQueryStatus.ALL) {
        return { queryParams: {}, status: PostsQueryStatus.ALL };
      }
      if (newStatus === PostsQueryStatus.IGNORED) {
        return {
          queryParams: { semantics: { topics: [NOT_SCIENCE_TOPIC_URI] } },
          status: PostsQueryStatus.IGNORED,
        };
      }
      if (newStatus === PostsQueryStatus.IS_SCIENCE) {
        return {
          queryParams: { semantics: { topics: [SCIENCE_TOPIC_URI] } },
          status: PostsQueryStatus.IS_SCIENCE,
        };
      }
    }
    return { queryParams: {}, status: PostsQueryStatus.ALL };
  }, [location]);

  const onPostsAdded = useCallback((newPosts: AppPostFull[]) => {
    /** trigger parse if not parsed and not parsing */
    newPosts.forEach((post) => {
      if (
        post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsingStatus !== AppPostParsingStatus.PROCESSING
      ) {
        // async trigger parse
        console.warn(`skipping triggering reparsing of post ${post.id}`);
        // appFetch(`/api/posts/parse`, { postId: post.id }).catch(
        //   console.error
        // );
      }
    });
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

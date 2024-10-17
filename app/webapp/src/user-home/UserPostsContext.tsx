import React, { useContext, useEffect, useMemo, useState } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

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
  PostsQueryStatus,
} from '../shared/types/types.posts';

const DEBUG = true;

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

  const location = useLocation();

  /** status is derived from location
   * set the filter status based on it */
  const status = useMemo(() => {
    if (
      Object.values(PostsQueryStatus)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      const newStatus = location.pathname.slice(1) as PostsQueryStatus;
      if (DEBUG)
        console.log(`changing status based on location to ${newStatus}`);
      return newStatus;
    }
    return PostsQueryStatus.DRAFTS;
  }, [location]);

  const onPostsAdded = (newPosts: AppPostFull[]) => {
    /** trigger parse if not parsed and not parsing */
    newPosts.forEach((post) => {
      if (
        post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsingStatus !== AppPostParsingStatus.PROCESSING
      ) {
        // async trigger parse
        appFetch(`/api/posts/parse`, { postId: post.id });
      }
    });
  };

  const config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/posts/getOfUser',
      status,
      subscribe: true,
      onPostsAdded,
      DEBUG_PREIX: '[USER POSTS] ',
    };
  }, [status]);

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

import React, { useContext, useEffect } from 'react';
import { createContext } from 'react';

import {
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { PostsQueryStatus } from '../shared/types/types.posts';

interface FeedContextType {
  feed: PostFetcherInterface;
}

export const FeedPostsContextValue = createContext<FeedContextType | undefined>(
  undefined
);

/**
 * wraps the usePostsFetcher around the feed endpoint and serves
 * the returned posts to lower level components as useFeedPosts()
 */
export const FeedPostsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  useEffect(() => {
    console.log('FeedPostsContext mounted');
    return () => console.log('FeedPostsContext cleanup');
  }, []);

  const feed = usePostsFetcher({
    endpoint: '/api/feed/get',
    status: PostsQueryStatus.PUBLISHED,
  });

  return (
    <FeedPostsContextValue.Provider
      value={{
        feed,
      }}>
      {children}
    </FeedPostsContextValue.Provider>
  );
};

export const useFeedPosts = () => {
  const context = useContext(FeedPostsContextValue);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

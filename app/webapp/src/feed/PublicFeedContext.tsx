import React, { useContext } from 'react';
import { createContext } from 'react';

import {
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';

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
  const feed = usePostsFetcher('/api/posts/feed');

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

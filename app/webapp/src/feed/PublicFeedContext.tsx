import React, { useContext, useEffect, useMemo } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

import {
  FetcherConfig,
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { PostsQueryStatus } from '../shared/types/types.posts';
import { locationToFeedIx } from './FeedTabs';
import { feedTabs } from './feed.config';

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
  const location = useLocation();

  const feed0 = usePostsFetcher({
    endpoint: '/api/feed/get',
    labels: feedTabs[0].labels,
  });

  const feed1 = usePostsFetcher({
    endpoint: '/api/feed/get',
    labels: feedTabs[1].labels,
  });

  const feed2 = usePostsFetcher({
    endpoint: '/api/feed/get',
    labels: feedTabs[2].labels,
  });

  const feeds = [feed0, feed1, feed2];

  const feedIx = locationToFeedIx(location);
  const feed = feeds[feedIx];

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

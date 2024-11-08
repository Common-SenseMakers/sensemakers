import React, { useContext, useMemo } from 'react';
import { createContext } from 'react';

import {
  FetcherConfig,
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { FeedTabConfig, feedTabs } from './feed.config';

interface PublicFeedsContextType {
  feeds: PostFetcherInterface[];
}

export const FeedPostsContextValue = createContext<
  PublicFeedsContextType | undefined
>(undefined);

const getFeedConfig = (
  tab: FeedTabConfig,
  DEBUG_PREFIX: string
): FetcherConfig => {
  return {
    endpoint: '/api/feed/get',
    queryParams: { semantics: { labels: tab.labels, topic: tab.topic } },
    DEBUG_PREFIX,
  };
};

/**
 * wraps the usePostsFetcher around the feed endpoint and serves
 * the returned posts to lower level components as useFeedPosts()
 */
export const PublicFeedsContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const feed0Config = useMemo((): FetcherConfig => {
    return getFeedConfig(feedTabs[0], '[FEED 0] ');
  }, []);

  const feed1Config = useMemo((): FetcherConfig => {
    return getFeedConfig(feedTabs[1], '[FEED 1] ');
  }, []);

  const feed2Config = useMemo((): FetcherConfig => {
    return getFeedConfig(feedTabs[2], '[FEED 2] ');
  }, []);

  const feed3Config = useMemo((): FetcherConfig => {
    return getFeedConfig(feedTabs[3], '[FEED 3] ');
  }, []);

  const feed4Config = useMemo((): FetcherConfig => {
    return getFeedConfig(feedTabs[4], '[FEED 4] ');
  }, []);

  const feed0 = usePostsFetcher(feed0Config);
  const feed1 = usePostsFetcher(feed1Config);
  const feed2 = usePostsFetcher(feed2Config);
  const feed3 = usePostsFetcher(feed3Config);
  const feed4 = usePostsFetcher(feed4Config);

  const feeds = [feed0, feed1, feed2, feed3, feed4];

  return (
    <FeedPostsContextValue.Provider
      value={{
        feeds,
      }}>
      {children}
    </FeedPostsContextValue.Provider>
  );
};

export const useFeedPosts = () => {
  const context = useContext(FeedPostsContextValue);
  if (!context) {
    throw new Error('useFeedPosts must be used within a PostProvider');
  }
  return context;
};

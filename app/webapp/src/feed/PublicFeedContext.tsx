import React, { useContext, useEffect, useMemo } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

import {
  FetcherConfig,
  PostFetcherInterface,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { locationToFeedIx } from './FeedTabs';
import { feedTabs } from './feed.config';

const DEBUG = false;
const DEBUG_PREFIX = ``;

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

  // for debug
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}FeedPostsContext mounted`);
    }
    return () => {
      mounted = false;
      if (DEBUG) console.log(`${DEBUG_PREFIX}FeedPostsContext unmounted`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed0Config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: { semantics: { labels: feedTabs[0].labels } },
      DEBUG_PREFIX: `[FEED 0] `,
    };
  }, []);

  const feed1Config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: { semantics: { labels: feedTabs[1].labels } },
      DEBUG_PREFIX: `[FEED 0] `,
    };
  }, []);

  const feed2Config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: { semantics: { labels: feedTabs[2].labels } },
      DEBUG_PREFIX: `[FEED 0] `,
    };
  }, []);

  const feed3Config = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: { semantics: { labels: feedTabs[3].labels } },
      DEBUG_PREFIX: `[FEED 0] `,
    };
  }, []);

  const feed0 = usePostsFetcher(feed0Config);
  const feed1 = usePostsFetcher(feed1Config);
  const feed2 = usePostsFetcher(feed2Config);
  const feed3 = usePostsFetcher(feed3Config);

  const feeds = [feed0, feed1, feed2, feed3];

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
    throw new Error('useFeedPosts must be used within a PostProvider');
  }
  return context;
};

import { Box } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { Location, useLocation, useSearchParams } from 'react-router-dom';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { MultiTabFeeds } from '../feed/MultiTabFeeds';
import { FeedTabConfig, feedTabs } from '../feed/feed.config';
import { ShowOverlayProps } from '../overlays/Overlay';
import { OverlayContext, OverlayQueryParams } from '../overlays/OverlayContext';
import { eventToOverlay, hasSearchParam } from '../overlays/overlay.utils';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import {
  PostClickEvent,
  PostClickTarget,
} from '../semantics/patterns/patterns';

const DEBUG = false;

export const locationToFeedIx = (location: Location) => {
  if (DEBUG) console.log(location);

  const pageIx = feedTabs.findIndex((tab) =>
    location.pathname.startsWith(`/feed/${tab.id}`)
  );

  if (pageIx === -1) {
    return 0;
  } else {
    return pageIx;
  }
};

export const feedIndexToPathname = (ix: number) => {
  return `/feed/${feedTabs[ix].id}`;
};

const getFeedConfig = (
  tab: FeedTabConfig,
  DEBUG_PREFIX: string
): FetcherConfig => {
  return {
    endpoint: '/api/feed/get',
    queryParams: {
      semantics: { labels: tab.labels, topic: tab.topic },
      includeAggregateLabels: true,
    },
    DEBUG_PREFIX,
  };
};

export const PublicFeedPage = () => {
  const location = useLocation();
  const ixInit = locationToFeedIx(location);

  const [searchParams] = useSearchParams();
  const [overlayInit, setOverlayInit] = useState<
    ShowOverlayProps | undefined | null
  >();

  /** check for URL parameters and set the overlayInit.
   * it does it only once at page load
   */
  useEffect(() => {
    if (!hasSearchParam(searchParams)) {
      setOverlayInit(null);
    }

    Object.values(OverlayQueryParams).forEach((key) => {
      if (searchParams.has(key)) {
        const event: PostClickEvent | undefined = (() => {
          if (key === OverlayQueryParams.Post) {
            return {
              target: PostClickTarget.POST,
              payload: searchParams.get(key),
            };
          }
          if (key === OverlayQueryParams.Keyword) {
            return {
              target: PostClickTarget.KEYWORD,
              payload: searchParams.get(key),
            };
          }
          if (key === OverlayQueryParams.Ref) {
            return {
              target: PostClickTarget.REF,
              payload: searchParams.get(key),
            };
          }
          if (key === OverlayQueryParams.User) {
            return {
              target: PostClickTarget.USER_ID,
              payload: searchParams.get(key),
            };
          }
          if (key === OverlayQueryParams.Profile) {
            return {
              target: PostClickTarget.PLATFORM_USER_ID,
              payload: searchParams.get(key),
            };
          }
        })();

        if (event) {
          const _overlay = eventToOverlay(event);
          if (_overlay) {
            setOverlayInit(_overlay);
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <ViewportPage
      fixed
      content={
        <Box style={{ position: 'relative', paddingTop: '16px' }}>
          {overlayInit !== undefined && (
            <OverlayContext init={overlayInit}>
              <MultiTabFeeds
                feeds={feeds}
                tabs={feedTabs}
                feedIxInit={ixInit}></MultiTabFeeds>
            </OverlayContext>
          )}
        </Box>
      }
      nav={<GlobalNav></GlobalNav>}
      justify="start"></ViewportPage>
  );
};

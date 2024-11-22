import { Box } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { Location, useLocation, useSearchParams } from 'react-router-dom';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { MultiTabFeeds } from '../feed/MultiTabFeeds';
import { FeedTabConfig, feedTabs } from '../feed/feed.config';
import { OverlayValue } from '../overlays/Overlay';
import { OverlayContext, OverlayQueryParams } from '../overlays/OverlayContext';
import { PublicFeedContext } from '../overlays/PublicFeedContext';
import {
  eventToOverlay,
  hasSearchParam,
  searchParamsKeyValueToEvent,
} from '../overlays/overlay.utils';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { PostClickEvent } from '../semantics/patterns/patterns';

const DEBUG = true;

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

  const [searchParams, setSearchParams] = useSearchParams();

  const ixInit = useMemo(() => locationToFeedIx(location), [location]);

  const [overlayInit, setOverlayInit] = useState<
    OverlayValue | undefined | null
  >();

  /** check for URL parameters and set the overlayInit.
   * it does it only once at page load
   */
  useEffect(() => {
    const has = hasSearchParam(searchParams);
    if (DEBUG) console.log('PublicFeedPage initial useEffect', { has });

    if (!has) {
      setOverlayInit(null);
    }

    Object.values(OverlayQueryParams).forEach((key) => {
      if (searchParams.has(key)) {
        const event: PostClickEvent | undefined = searchParamsKeyValueToEvent(
          key,
          searchParams.get(key)
        );

        if (DEBUG)
          console.log(`PublicFeedPage initial useEffect - found ${key}`, {
            event,
          });

        if (event) {
          const _overlay = eventToOverlay(event);
          if (_overlay) {
            if (DEBUG)
              console.log(`PublicFeedPage initial useEffect - setOverlay`, {
                _overlay,
              });

            setOverlayInit(_overlay);
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSearchParam = (key: string, value: string) => {
    if (DEBUG) console.log(`setSearchParam: ${key}=${value}`);

    searchParams.forEach((value, key) => {
      searchParams.delete(key);
    });
    searchParams.append(key, value);
    setSearchParams(searchParams);
  };

  const onOverlayNav = (overlay: OverlayValue) => {
    if (DEBUG)
      console.log(`PublicFeedPage - onOverlayNav`, {
        overlay,
      });

    syncQueryParams(overlay);
  };

  const syncQueryParams = (overlay: OverlayValue) => {
    if (Object.keys(overlay).length === 0) {
      searchParams.forEach((value, key) => {
        searchParams.delete(key);
      });
      if (DEBUG)
        console.log(`PublicFeedPage - syncQueryParams - delete all`, {
          overlay,
        });

      setSearchParams(searchParams);
      return;
    }

    if (overlay.post) {
      /** prevent dup nav */
      const current = searchParams.get(OverlayQueryParams.Post);
      if (current === null || current !== overlay.post.id) {
        setSearchParam(OverlayQueryParams.Post, overlay.post.id);
      }
      return;
    }
    if (overlay.ref) {
      const current = searchParams.get(OverlayQueryParams.Ref);
      if (current === null || current !== overlay.ref) {
        setSearchParam(OverlayQueryParams.Ref, overlay.ref);
      }
      return;
    }
    if (overlay.userId) {
      const current = searchParams.get(OverlayQueryParams.User);
      if (current === null || current !== overlay.userId) {
        setSearchParam(OverlayQueryParams.User, overlay.userId);
      }
      return;
    }
    if (overlay.profileId) {
      const current = searchParams.get(OverlayQueryParams.Profile);
      if (current === null || current !== overlay.profileId) {
        setSearchParam(OverlayQueryParams.Profile, overlay.profileId);
      }
      return;
    }
    if (overlay.keyword) {
      const current = searchParams.get(OverlayQueryParams.Keyword);
      if (current === null || current !== overlay.keyword) {
        setSearchParam(OverlayQueryParams.Keyword, overlay.keyword);
      }
      return;
    }
  };

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
          <PublicFeedContext>
            {overlayInit !== undefined && (
              <OverlayContext
                init={overlayInit}
                onOverlayNav={(overlay) => onOverlayNav(overlay)}>
                <MultiTabFeeds
                  feeds={feeds}
                  tabs={feedTabs}
                  feedIxInit={ixInit}></MultiTabFeeds>
              </OverlayContext>
            )}
          </PublicFeedContext>
        </Box>
      }
      nav={<GlobalNav></GlobalNav>}
      justify="start"></ViewportPage>
  );
};

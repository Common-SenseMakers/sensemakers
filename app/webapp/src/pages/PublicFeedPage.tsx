import { Box } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { useDetailsParams } from '../app/layout/details.params.hook';
import { KeywordsSuggestions } from '../clusters/keywords.suggestions';
import { MultiTabFeeds } from '../feed/MultiTabFeeds';
import { PeriodSelector } from '../feed/PeriodSelector';
import { OverlayValue } from '../overlays/Overlay';
import { OverlayContext, OverlayQueryParams } from '../overlays/OverlayContext';
import { PublicFeedContext } from '../overlays/PublicFeedContext';
import {
  eventToOverlay,
  hasSearchParam,
  searchParamsKeyValueToEvent,
} from '../overlays/overlay.utils';
import { ALL_CLUSTER_NAME } from '../posts.fetcher/cluster.context';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { ClusterProfiles } from '../profiles/ClusterProfiles';
import { AbsoluteRoutes } from '../route.names';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { PeriodSize } from '../shared/types/types.posts';
import { TabQuery, feedTabs } from '../shared/utils/feed.config';

const DEBUG = false;

const getFeedConfig = (
  tabQuery: TabQuery,
  DEBUG_PREFIX: string
): FetcherConfig => {
  return {
    endpoint: '/api/feed/get',
    queryParams: {
      semantics: { tab: tabQuery.tab, topic: tabQuery.topic },
      hydrateConfig: { addAggregatedLabels: true },
      clusterId:
        tabQuery.clusterId !== ALL_CLUSTER_NAME
          ? tabQuery.clusterId
          : undefined,
    },
    DEBUG_PREFIX,
  };
};

export const PublicFeedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clusterId: clusterSelected, tabId } = useParams();

  const [overlayInit, setOverlayInit] = useState<
    OverlayValue | undefined | null
  >();

  const { hideDetails } = useDetailsParams();

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

  /** keeps the url query params aligend with the current visible overlay */
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

  const [periodSize, setPeriodSize] = useState<PeriodSize>(PeriodSize.Day);
  const [shift, setShift] = useState(0);

  const feed0Config = useMemo((): FetcherConfig => {
    return getFeedConfig(
      {
        tab: feedTabs[0].index,
        topic: feedTabs[0].topic,
        clusterId: clusterSelected,
        periodSize,
        shift,
      },
      '[FEED 0] '
    );
  }, [clusterSelected, periodSize, shift]);

  const feed1Config = useMemo((): FetcherConfig => {
    return getFeedConfig(
      {
        tab: feedTabs[1].index,
        topic: feedTabs[1].topic,
        clusterId: clusterSelected,
        periodSize,
        shift,
      },
      '[FEED 1] '
    );
  }, [clusterSelected, periodSize, shift]);

  const feed2Config = useMemo((): FetcherConfig => {
    return getFeedConfig(
      {
        tab: feedTabs[2].index,
        topic: feedTabs[2].topic,
        clusterId: clusterSelected,
        periodSize,
        shift,
      },
      '[FEED 2] '
    );
  }, [clusterSelected, periodSize, shift]);

  const feed3Config = useMemo((): FetcherConfig => {
    return getFeedConfig(
      {
        tab: feedTabs[3].index,
        topic: feedTabs[3].topic,
        clusterId: clusterSelected,
        periodSize,
        shift,
      },
      '[FEED 3] '
    );
  }, [clusterSelected, periodSize, shift]);

  const feed4Config = useMemo((): FetcherConfig => {
    return getFeedConfig(
      {
        tab: feedTabs[4].index,
        topic: feedTabs[4].topic,
        clusterId: clusterSelected,
        periodSize,
        shift,
      },
      '[FEED 4] '
    );
  }, [clusterSelected, periodSize, shift]);

  const feed0 = usePostsFetcher(feed0Config);
  const feed1 = usePostsFetcher(feed1Config);
  const feed2 = usePostsFetcher(feed2Config);
  const feed3 = usePostsFetcher(feed3Config);
  const feed4 = usePostsFetcher(feed4Config);

  const feeds = [feed0, feed1, feed2, feed3, feed4];

  const navigate = useNavigate();

  const onFeedIxChanged = (ix: number) => {
    const tabId = feedTabs[ix].id;
    navigate(AbsoluteRoutes.ClusterFeed(tabId, clusterSelected));
  };

  const feedIx = feedTabs.findIndex((tab) => tab.id === tabId);

  const onKeywordClick = (kw: string) => {
    setOverlayInit({ keyword: kw });
  };

  const [resetOverlays, setResetOverlays] = useState(false);

  /** if the url params change, reset all overlays */
  useEffect(() => {
    setResetOverlays(!resetOverlays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, clusterSelected]);

  const onProfileClick = (profileId: string) => {
    setOverlayInit({ profileId });
    hideDetails();
  };

  const handlePeriodChange = (optionSize: PeriodSize, shift: number) => {
    setShift(shift);
    setPeriodSize(optionSize);
  };

  return (
    <ViewportPage
      fixed
      content={
        <Box style={{ position: 'relative', paddingTop: '16px' }}>
          <PeriodSelector
            boxProps={{ style: { marginBottom: '12px' } }}
            onPeriodSelected={handlePeriodChange}></PeriodSelector>

          <PublicFeedContext isPublicFeed>
            {overlayInit !== undefined && (
              <OverlayContext
                init={overlayInit}
                triggerReset={resetOverlays}
                onOverlayNav={(overlay) => onOverlayNav(overlay)}>
                <MultiTabFeeds
                  feeds={feeds}
                  tabs={feedTabs}
                  feedIx={feedIx !== -1 ? feedIx : 0}
                  onFeedIxChanged={(ix) => onFeedIxChanged(ix)}></MultiTabFeeds>
              </OverlayContext>
            )}
          </PublicFeedContext>
        </Box>
      }
      nav={<GlobalNav></GlobalNav>}
      suggestions={
        <KeywordsSuggestions
          onKeywordClick={(kw) => onKeywordClick(kw)}></KeywordsSuggestions>
      }
      profiles={
        <ClusterProfiles
          onProfileClick={(p) => onProfileClick(p)}></ClusterProfiles>
      }
      justify="start"></ViewportPage>
  );
};

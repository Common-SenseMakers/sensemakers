import { Box } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { OnOverlayShown, OverlayLayout } from '../posts.fetcher/OverlayLayout';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { PostFetcherInterface } from '../posts.fetcher/posts.fetcher.hook';
import { FeedTabs } from './FeedTabs';
import { FeedTabConfig } from './feed.config';

export const MultiTabFeeds = (
  props: {
    feeds: PostFetcherInterface[];
    tabs: FeedTabConfig[];
    feedIxInit?: number;
  } & OnOverlayShown
) => {
  const { t } = useTranslation();
  const [showTop, setShowTop] = useState(true);

  const { feeds, tabs, feedIxInit } = props;

  const [feedIx, setFeedIx] = useState<number>(feedIxInit || 0);

  const n = feeds.length;
  const percWidth = 100 / n;

  return (
    <>
      <OverlayLayout
        top={
          <FeedTabs
            feedIx={feedIx}
            onTabClicked={(ix) => setFeedIx(ix)}
            feedTabs={tabs}></FeedTabs>
        }
        bottom={
          <div
            style={{
              height: `calc(100%${showTop ? '- 48px' : ''})`,
              overflow: 'hidden',
            }}>
            <div
              style={{
                transform: `translateX(${-1 * feedIx * percWidth}%)`,
                transition: ' transform 0.5s ease-in-out',
                height: '100%',
                width: `${feeds.length * 100}%`,
              }}>
              {feeds.map((feed, ix) => {
                return (
                  <Box
                    key={ix}
                    style={{
                      width: `${percWidth}%`,
                      height: '100%',
                      float: 'left',
                    }}>
                    <PostsFetcherComponent
                      onOverlayShown={() => setShowTop(!showTop)}
                      showHeader={false}
                      isPublicFeed={true}
                      feed={feed}
                      pageTitle={t(
                        AppGeneralKeys.feedTitle
                      )}></PostsFetcherComponent>
                  </Box>
                );
              })}
            </div>
          </div>
        }></OverlayLayout>
    </>
  );
};

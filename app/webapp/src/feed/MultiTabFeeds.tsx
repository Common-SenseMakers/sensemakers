import { Box } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppGeneralKeys } from '../i18n/i18n.app.general';
import {
  OverlayConfig,
  PostsFetcherComponent,
} from '../posts.fetcher/PostsFetcherComponent';
import { PostFetcherInterface } from '../posts.fetcher/posts.fetcher.hook';
import { AppHeading } from '../ui-components';
import { FeedTabs } from './FeedTabs';
import { FeedTabConfig } from './feed.config';

export const MultiTabFeeds = (props: {
  feeds: PostFetcherInterface[];
  tabs: FeedTabConfig[];
  feedIxInit?: number;
}) => {
  const { t } = useTranslation();

  const { feeds, tabs, feedIxInit } = props;

  const [feedIx, setFeedIx] = useState<number>(feedIxInit || 0);

  const n = feeds.length;
  const percWidth = 100 / n;

  const overlayConfig: OverlayConfig = {
    post: { enabled: true },
    ref: { enabled: true },
    user: { enabled: true },
  };

  return (
    <>
      <Box fill justify="start" style={{ height: '100%' }}>
        <Box
          pad={{ horizontal: '12px', vertical: '6px' }}
          margin={{ bottom: '4px' }}>
          <AppHeading level="2">{'Explore'}</AppHeading>
        </Box>

        <FeedTabs
          feedIx={feedIx}
          onTabClicked={(ix) => setFeedIx(ix)}
          feedTabs={tabs}></FeedTabs>

        <div style={{ height: 'calc(100% - 48px)', overflow: 'hidden' }}>
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
                    overlayConfig={overlayConfig}
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
      </Box>
    </>
  );
};

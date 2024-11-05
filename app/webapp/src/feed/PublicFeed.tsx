import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { FeedTabs, locationToFeedIx } from './FeedTabs';
import { useFeedPosts } from './PublicFeedsContext';

export const PublicFeed = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const { feeds } = useFeedPosts();
  const n = feeds.length;
  const percWidth = 100 / n;

  const feedIx = locationToFeedIx(location);

  return (
    <>
      <Box fill justify="start" style={{ height: '100%' }}>
        <FeedTabs></FeedTabs>
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
                  style={{
                    width: `${percWidth}%`,
                    height: '100%',
                    float: 'left',
                  }}>
                  <PostsFetcherComponent
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

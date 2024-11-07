import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { AppHeading } from '../ui-components';
import { useSwap } from '../ui-components/hooks/useSwap';
import { FeedTabs, feedIndexToPathname, locationToFeedIx } from './FeedTabs';
import { useFeedPosts } from './PublicFeedsContext';
import { feedTabs } from './feed.config';

export const PublicFeed = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { feeds } = useFeedPosts();
  const n = feeds.length;
  const percWidth = 100 / n;

  const feedIx = locationToFeedIx(location);
  const swipeLeft = () => {
    if (feedTabs.length > 2 && feedIx < feedTabs.length - 2) {
      navigate(feedIndexToPathname(feedIx + 1));
    }
  };

  const swipeRight = () => {
    if (feedIx > 0) {
      navigate(feedIndexToPathname(feedIx - 1));
    }
  };

  const touchEvents = useSwap({
    left: () => swipeLeft(),
    right: () => swipeRight(),
  });

  return (
    <>
      <Box fill justify="start" style={{ height: '100%' }}>
        <Box
          pad={{ horizontal: '12px', vertical: '6px' }}
          margin={{ bottom: '4px' }}>
          <AppHeading level="2">{'Explore'}</AppHeading>
        </Box>

        <FeedTabs></FeedTabs>

        <div
          style={{ height: 'calc(100% - 48px)', overflow: 'hidden' }}
          onTouchStart={touchEvents.onTouchStart}
          onTouchEnd={touchEvents.onTouchEnd}
          onTouchMove={touchEvents.onTouchMove}>
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

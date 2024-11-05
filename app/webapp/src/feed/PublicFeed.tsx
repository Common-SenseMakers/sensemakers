import { Box } from 'grommet';
import { useEffect } from 'react';
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

  const feedIx = locationToFeedIx(location);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    const postId = location.state?.postId as string;

    if (postId) {
      const postCard = document.querySelector(`#post-${postId}`);
      const viewportPage = document.querySelector('#content');
      if (postCard && viewportPage) {
        timeout = setTimeout(() => {
          postCard.scrollIntoView({
            behavior: 'instant' as ScrollBehavior,
            block: 'center',
          });
        }, 0);
      }
    }
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      <Box fill justify="start">
        <FeedTabs></FeedTabs>
        {feeds.map((feed, ix) => {
          return (
            <Box
              style={
                feedIx === ix
                  ? { height: 'auto', visibility: 'visible' }
                  : { height: '0px', visibility: 'hidden' }
              }>
              <PostsFetcherComponent
                showHeader={false}
                isPublicFeed={true}
                feed={feed}
                pageTitle={t(AppGeneralKeys.feedTitle)}></PostsFetcherComponent>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

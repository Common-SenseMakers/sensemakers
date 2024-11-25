import { Box } from 'grommet';
import { useMemo } from 'react';

import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
import { AppHeading } from '../ui-components';
import { OverlayContext } from './OverlayContext';
import { usePublicFeed } from './PublicFeedContext';

/** extract the postId from the route and pass it to a PostContext */
export const KeywordOverlay = (props: { keyword: string }) => {
  const { keyword } = props;
  const publicFeedContext = usePublicFeed();
  const isPublicFeed = publicFeedContext && publicFeedContext.isPublicFeed;

  const feedConfig = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: {
        semantics: { keywords: [keyword], topic: SCIENCE_TOPIC_URI },
        includeAggregateLabels: false,
      },
      DEBUG_PREFIX: 'REF FEED',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = usePostsFetcher(feedConfig);

  return (
    <OverlayContext>
      <Box>
        <Box
          pad="medium"
          style={{
            flexShrink: 0,
            border: '1.6px solid var(--Neutral-300, #D1D5DB)',
          }}>
          <AppHeading level="2">{`#${keyword}`}</AppHeading>
        </Box>
        <PostsFetcherComponent
          showHeader={false}
          isPublicFeed={isPublicFeed}
          feed={feed}></PostsFetcherComponent>
      </Box>
    </OverlayContext>
  );
};

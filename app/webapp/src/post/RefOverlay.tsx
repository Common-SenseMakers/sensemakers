import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { RefCard } from '../semantics/patterns/common/RefCard';
import { RefMeta } from '../shared/types/types.parser';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
import { AppHeading } from '../ui-components';
import { OnOverlayNav, OverlayNav } from './OverlayNav';

const DEBUG = true;

/** extract the postId from the route and pass it to a PostContext */
export const RefOverlay = (props: {
  refUrl: string;
  overlayNav: OnOverlayNav;
}) => {
  const appFetch = useAppFetch();
  const { refUrl, overlayNav } = props;

  const { data: refMeta } = useQuery({
    queryKey: ['ref', refUrl],
    queryFn: async () => {
      try {
        if (refUrl) {
          if (DEBUG) console.log(`fetching ref ${refUrl}`);
          const refMeta = await appFetch<RefMeta>('/api/refs/get', {
            ref: refUrl,
          });
          return refMeta;
        }
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
  });

  const feedConfig = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: {
        semantics: { refs: [refUrl], topic: SCIENCE_TOPIC_URI },
        includeAggregateLabels: true,
      },
      DEBUG_PREFIX: 'REF FEED',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = usePostsFetcher(feedConfig);

  return (
    <Box>
      <OverlayNav overlayNav={overlayNav}></OverlayNav>
      <Box
        pad="medium"
        style={{
          flexShrink: 0,
          border: '1.6px solid var(--Neutral-300, #D1D5DB)',
        }}>
        <AppHeading level="3">Posts about</AppHeading>
        <RefCard
          url={refUrl}
          title={refMeta?.title}
          description={refMeta?.summary}
          image={refMeta?.thumbnail_url}
          refType={refMeta?.item_type}></RefCard>
      </Box>
      <PostsFetcherComponent
        showHeader={false}
        isPublicFeed={true}
        feed={feed}
        pageTitle={'Ref'}></PostsFetcherComponent>
    </Box>
  );
};

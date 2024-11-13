import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { RefWithLabels } from '../semantics/patterns/refs-labels/RefWithLabels';
import { RefMeta } from '../shared/types/types.parser';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
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
  const refData = { labelsUris: refMeta?.labels || [], meta: refMeta };
  return (
    <Box>
      <OverlayNav overlayNav={overlayNav}></OverlayNav>
      <Box
        pad="medium"
        style={{
          flexShrink: 0,
          border: '1.6px solid var(--Neutral-300, #D1D5DB)',
        }}>
        <RefWithLabels
          ix={0}
          showLabels={true}
          showDescription={true}
          editable={false}
          refUrl={refUrl}
          refData={refData}
          refLabels={refMeta?.refLabels}
          allRefs={[[refUrl, refData]]}
          ontology={refMeta?.ontology}
          removeLabel={() => {
            return undefined;
          }}
          addLabel={() => {
            return undefined;
          }}></RefWithLabels>
      </Box>
      <PostsFetcherComponent
        enableOverlay={{ post: false, ref: false, user: false }}
        showHeader={false}
        isPublicFeed={true}
        feed={feed}
        pageTitle={'Ref'}></PostsFetcherComponent>
    </Box>
  );
};

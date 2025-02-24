import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  PAGE_SIZE,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { RefWithLabels } from '../semantics/patterns/refs-labels/RefWithLabels';
import { PLATFORM } from '../shared/types/types.platforms';
import { PlatformProfile } from '../shared/types/types.profiles';
import { RefDisplayMeta } from '../shared/types/types.references';
import {
  SCIENCE_TOPIC_URI,
  parseRefDisplayMeta,
} from '../shared/utils/semantics.helper';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { OverlayContext } from './OverlayContext';
import { usePublicFeed } from './PublicFeedContext';

const DEBUG = false;

/** extract the postId from the route and pass it to a PostContext */
export const RefOverlay = (props: { refUrl: string }) => {
  const appFetch = useAppFetch();
  const { refUrl } = props;

  const { connectedUser } = useAccountContext();
  const [accountProfileId, setAccountProfileId] = useState<string | undefined>(
    undefined
  );

  const publicFeedContext = usePublicFeed();
  const isPublicFeed = publicFeedContext && publicFeedContext.isPublicFeed;

  useEffect(() => {
    Object.entries(connectedUser?.profiles || {}).forEach(([key, value]) => {
      if (key !== PLATFORM.Orcid && value) {
        setAccountProfileId(`${key}-${(value.profile as PlatformProfile).id}`);
      }
    });
  }, [connectedUser]);

  const { data: refDisplayMeta } = useQuery({
    queryKey: ['ref', refUrl],
    queryFn: async () => {
      try {
        if (refUrl) {
          if (DEBUG) console.log(`fetching ref ${refUrl}`);
          const refMeta = await appFetch<RefDisplayMeta>('/api/refs/get', {
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
        semantics: { ref: refUrl, topic: SCIENCE_TOPIC_URI },
        hydrateConfig: { addAggregatedLabels: false },
        fetchParams: {
          expectedAmount: PAGE_SIZE,
          rankByScore: 'score1',
        },
      },
      DEBUG_PREFIX: 'REF FEED',
      enabled: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = usePostsFetcher(feedConfig);

  const { authorLabels, nonAuthorLabels } = parseRefDisplayMeta(
    refDisplayMeta,
    accountProfileId
  );

  return (
    <OverlayContext>
      <Box>
        <Box
          pad="medium"
          style={{
            flexShrink: 0,
            border: '1.6px solid var(--Neutral-300, #D1D5DB)',
          }}>
          {refDisplayMeta?.oembed ? (
            <RefWithLabels
              ix={1}
              oembed={refDisplayMeta.oembed}
              authorLabels={authorLabels || []}
              aggregatedLabels={nonAuthorLabels || []}
              showAggregatedLabels={true}
              showDescription={true}
              editable={false}
              ontology={refDisplayMeta?.ontology}
              removeLabel={() => {
                return undefined;
              }}
              addLabel={() => {
                return undefined;
              }}></RefWithLabels>
          ) : (
            <LoadingDiv height={'120px'} style={{ width: '100%' }}></LoadingDiv>
          )}
        </Box>
        <PostsFetcherComponent
          showHeader={false}
          isPublicFeed={isPublicFeed}
          feed={feed}
          pageTitle={'Ref'}></PostsFetcherComponent>
      </Box>
    </OverlayContext>
  );
};

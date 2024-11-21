import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { RefWithLabels } from '../semantics/patterns/refs-labels/RefWithLabels';
import { RefMeta } from '../shared/types/types.parser';
import { PLATFORM } from '../shared/types/types.platforms';
import { PlatformProfile } from '../shared/types/types.profiles';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { OverlayContext } from './OverlayContext';

const DEBUG = true;

/** extract the postId from the route and pass it to a PostContext */
export const RefOverlay = (props: { refUrl: string }) => {
  const appFetch = useAppFetch();
  const { refUrl } = props;

  const { connectedUser } = useAccountContext();
  const [accountProfileId, setAccountProfileId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    Object.entries(connectedUser?.profiles || {}).forEach(([key, value]) => {
      if (key !== PLATFORM.Orcid && value) {
        setAccountProfileId(`${key}-${(value as PlatformProfile).id}`);
      }
    });
  }, [connectedUser]);

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
        includeAggregateLabels: false,
      },
      DEBUG_PREFIX: 'REF FEED',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = usePostsFetcher(feedConfig);

  const refData = {
    labelsUris:
      (refMeta?.refLabels || [])
        .filter((refLabel) => refLabel.authorProfileId === accountProfileId)
        .map((refLabel) => refLabel.label)
        .filter((label) => label !== 'https://sense-nets.xyz/quotesPost') || [],
    meta: refMeta,
  };

  return (
    <OverlayContext>
      <Box>
        <Box
          pad="medium"
          style={{
            flexShrink: 0,
            border: '1.6px solid var(--Neutral-300, #D1D5DB)',
          }}>
          <RefWithLabels
            ix={0}
            authorProfileId={accountProfileId}
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
          showHeader={false}
          isPublicFeed={true}
          feed={feed}
          pageTitle={'Ref'}></PostsFetcherComponent>
      </Box>
    </OverlayContext>
  );
};
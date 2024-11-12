import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useEffect, useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { AccountProfileHeader } from '../profiles/AccountProfileHeader';
import { AccountProfile } from '../shared/types/types.profiles';
import { GetProfilePayload } from '../shared/types/types.user';
import { splitProfileId } from '../shared/utils/profiles.utils';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
import { AppHeading } from '../ui-components';
import { OnOverlayNav, OverlayNav } from './OverlayNav';

const DEBUG = true;

/** extract the postId from the route and pass it to a PostContext */
export const UserProfileOverlay = (props: {
  profileId?: string;
  userId?: string;
  overlayNav: OnOverlayNav;
}) => {
  const appFetch = useAppFetch();
  const { profileId, userId, overlayNav } = props;

  const { data: accounts } = useQuery({
    queryKey: ['userProfile', profileId, userId],
    queryFn: async () => {
      try {
        if (userId) {
          if (DEBUG) console.log(`fetching profiles of ${userId}`);
          const profiles = await appFetch<AccountProfile[]>('/api/users/get', {
            userId,
          });
          return profiles;
        } else if (profileId) {
          const { platform, user_id } = splitProfileId(profileId);
          const payload: GetProfilePayload = {
            platformId: platform,
            user_id,
          };
          const profile = await appFetch<AccountProfile, GetProfilePayload>(
            '/api/profiles/get',
            payload
          );
          return [profile];
        }
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
  });

  useEffect(() => {
    console.log({ accounts });
  }, [accounts]);

  const feedConfig = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: {
        userId: userId,
        profileId: profileId,
        semantics: { topic: SCIENCE_TOPIC_URI },
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
        <AppHeading level="3">Posts by</AppHeading>
        <Box margin={{ vertical: 'medium' }}>
          {userId ? (
            <></>
          ) : profileId ? (
            <AccountProfileHeader
              account={
                accounts !== undefined ? accounts[0] : undefined
              }></AccountProfileHeader>
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <PostsFetcherComponent
        showHeader={false}
        isPublicFeed={true}
        feed={feed}
        pageTitle={'Ref'}></PostsFetcherComponent>
    </Box>
  );
};

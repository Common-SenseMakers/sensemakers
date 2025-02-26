import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useEffect, useMemo } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { OverlayContext } from '../overlays/OverlayContext';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import {
  FetcherConfig,
  usePostsFetcher,
} from '../posts.fetcher/posts.fetcher.hook';
import { AccountProfileHeader } from '../profiles/AccountProfileHeader';
import { UserProfileHeader } from '../profiles/UserProfileHeader';
import {
  AccountProfileRead,
  GetProfilePayload,
} from '../shared/types/types.profiles';
import { AppUserPublicRead } from '../shared/types/types.user';
import { splitProfileId } from '../shared/utils/profiles.utils';
import { SCIENCE_TOPIC_URI } from '../shared/utils/semantics.helper';
import { usePublicFeed } from './PublicFeedContext';

const DEBUG = false;

/** extract the postId from the route and pass it to a PostContext */
export const UserProfileOverlay = (props: {
  profileId?: string;
  userId?: string;
}) => {
  const appFetch = useAppFetch();
  const { profileId, userId } = props;

  const publicFeedContext = usePublicFeed();
  const isPublicFeed = publicFeedContext && publicFeedContext.isPublicFeed;

  const isUser = userId !== undefined;

  const { data: profile } = useQuery({
    queryKey: ['userProfile', profileId],
    queryFn: async () => {
      try {
        if (profileId) {
          const { platform, user_id } = splitProfileId(profileId);
          const payload: GetProfilePayload = {
            platformId: platform,
            user_id,
          };
          const profile = await appFetch<AccountProfileRead, GetProfilePayload>(
            '/api/profiles/get',
            payload
          );

          return profile;
        }
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
    enabled: !!profileId,
  });

  const { data: user } = useQuery({
    queryKey: ['userPublicProfile', userId],
    queryFn: async () => {
      try {
        if (userId) {
          if (DEBUG) console.log(`fetching profiles of ${userId}`);
          const user = await appFetch<AppUserPublicRead>('/api/users/get', {
            userId,
          });

          return user;
        }
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (DEBUG) console.log({ user, profile });
  }, [user, profile]);

  const feedConfig = useMemo((): FetcherConfig => {
    return {
      endpoint: '/api/feed/get',
      queryParams: {
        userId: userId,
        profileId: userId !== undefined ? undefined : profileId,
        semantics: { topic: SCIENCE_TOPIC_URI },
        hydrateConfig: { addAggregatedLabels: true },
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
          <Box margin={{ vertical: 'medium' }}>
            {isUser ? (
              <UserProfileHeader user={user}></UserProfileHeader>
            ) : profile ? (
              <AccountProfileHeader
                autoIndexed
                accounts={[profile]}></AccountProfileHeader>
            ) : (
              <></>
            )}
          </Box>
        </Box>
        <PostsFetcherComponent
          showHeader={false}
          isPublicFeed={isPublicFeed}
          feed={feed}
          pageTitle={'Ref'}
          showAggregatedLabels={true}></PostsFetcherComponent>
      </Box>
    </OverlayContext>
  );
};

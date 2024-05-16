import { Anchor, Box, Text } from 'grommet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { AppLogo } from '../app/brand/AppLogo';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCard } from '../post/PostCard';
import { PLATFORM } from '../shared/types/types';
import {
  AppPostFull,
  ProfilePostsQuery,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ProfileHeader } from './ProfileHeader';

const DEBUG = true;

const PAGE_SIZE = 20;

const TABS_CONFIG: { label: string; labelsUris: string[] | undefined }[] = [
  {
    label: 'All',
    labelsUris: undefined,
  },
  {
    label: 'Thinks',
    labelsUris: [
      'http://purl.org/spar/cito/disagreesWith',
      'https://schema.org/Question',
      'http://purl.org/spar/cito/discusses',
      'http://purl.org/spar/cito/includesQuotationFrom',
      'https://sense-nets.xyz/asksQuestionAbout',
      'http://purl.org/spar/cito/agreesWith',
      'https://schema.org/Observation',
      'https://schema.org/Claim',
      'https://sense-nets.xyz/indicatesInterest',
      'http://purl.org/spar/cito/linksTo',
    ],
  },
  {
    label: 'Recommends',
    labelsUris: [
      'http://purl.org/spar/cito/reviews',
      'https://sense-nets.xyz/endorses',
      'https://sense-nets.xyz/mentionsListeningStatus',
      'https://sense-nets.xyz/recommends',
      'https://sense-nets.xyz/summarizes',
      'https://sense-nets.xyz/mentionsWatchingStatus',
      'https://sense-nets.xyz/mentionsReadingStatus',
    ],
  },
  {
    label: 'Announces',
    labelsUris: [
      'https://sense-nets.xyz/announcesResource',
      'https://sense-nets.xyz/mentionsCallForPapers',
      'https://sense-nets.xyz/mentionsFundingOpportunity',
      'https://sense-nets.xyz/announcesEvent',
      'https://sense-nets.xyz/announcesJob',
    ],
  },
];

/** extract the postId from the route and pass it to a PostContext */
export const ProfileView = (props: { username?: string }) => {
  const { constants } = useThemeContext();
  const username = props.username;

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const fetchedFirst = useRef<boolean>(false);

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetching, setIsFetching] = useState(false);
  const [errorFetching, setErrorFetching] = useState<Error>();

  const appFetch = useAppFetch();

  /** trigger the first fetch */
  useEffect(() => {
    if (posts.length === 0 && fetchedFirst.current === false) {
      fetchedFirst.current = true;
      if (DEBUG) console.log('first fetch');
      _fetchOlder({ selectedTab });
    }
  }, [posts]);

  useEffect(() => {
    reset();
    _fetchOlder({ selectedTab });
  }, [selectedTab]);

  const reset = () => {
    if (DEBUG) console.log('resetting posts');
    setPosts([]);
    setIsLoading(true);
  };

  /** reset at every status change  */
  useEffect(() => {
    reset();
  }, [selectedTab]);

  const addPosts = useCallback(
    (posts: AppPostFull[], position: 'start' | 'end') => {
      if (DEBUG) console.log(`addPosts called`, { posts });

      /** add posts  */
      setPosts((prev) => {
        const allPosts =
          position === 'end' ? prev.concat(posts) : posts.concat(prev);
        if (DEBUG) console.log(`pushing posts`, { prev, allPosts });
        return allPosts;
      });
    },
    []
  );

  const _oldestPostId = useMemo(() => {
    const oldest = posts ? posts[posts.length - 1]?.id : undefined;
    if (DEBUG) console.log(`recomputing oldest _oldestPostId ${oldest}`);
    return oldest;
  }, [posts]);

  /** fetch for more post backwards */
  const _fetchOlder = useCallback(
    async (inputs: { selectedTab: number; oldestPostId?: string }) => {
      const { selectedTab, oldestPostId } = inputs;
      if (!username) {
        return;
      }

      if (DEBUG) console.log(`fetching for older`);
      setIsFetching(true);
      try {
        const params: ProfilePostsQuery = {
          platformId: PLATFORM.Twitter,
          username,
          labelsUris: TABS_CONFIG[selectedTab].labelsUris,
          fetchParams: {
            expectedAmount: PAGE_SIZE,
            untilId: oldestPostId,
          },
        };
        if (DEBUG) console.log(`fetching for older`, params);
        const readPosts = await appFetch<AppPostFull[], ProfilePostsQuery>(
          '/api/posts/getProfilePosts',
          params
        );

        if (DEBUG) console.log(`fetching for older retrieved`, readPosts);
        addPosts(readPosts, 'end');
        setIsFetching(false);
        setIsLoading(false);
      } catch (e: any) {
        setIsFetching(false);
        setErrorFetching(e);
        setIsLoading(false);
      }
    },
    [appFetch]
  );

  /** public function to trigger fetching for older posts */
  const fetchOlder = useCallback(() => {
    if (DEBUG)
      console.log(`external fetchOlder`, { selectedTab, _oldestPostId });
    _fetchOlder({ selectedTab, oldestPostId: _oldestPostId });
  }, [_fetchOlder, _oldestPostId, selectedTab]);

  const content = (() => {
    if (!username) {
      return (
        <Box gap="12px">
          <LoadingDiv height="60px" width="100%"></LoadingDiv>
          <Box>
            {[1, 2, 4, 5, 6].map((ix) => (
              <LoadingDiv
                key={ix}
                height="108px"
                width="100%"
                margin={{ bottom: '2px' }}></LoadingDiv>
            ))}
          </Box>
        </Box>
      );
    }

    if (errorFetching) {
      return (
        <BoxCentered fill>
          <Text>Error reading user profile</Text>
        </BoxCentered>
      );
    }

    return (
      <>
        <Box
          pad={{ top: 'medium' }}
          style={{ backgroundColor: constants.colors.shade }}>
          <Box
            pad={{ horizontal: 'medium' }}
            direction="row"
            justify="start"
            width={'100%'}>
            <Anchor href="/" style={{ textDecoration: 'none' }}>
              <AppLogo></AppLogo>
            </Anchor>
          </Box>
          <ProfileHeader
            pad={{
              top: '12px',
              horizontal: '12px',
              bottom: '16px',
            }}></ProfileHeader>
        </Box>

        <Box
          pad={{ horizontal: '12px' }}
          align="center"
          direction="row"
          width={'100%'}
          style={{ borderBottom: '1px solid  #D1D5DB' }}>
          {TABS_CONFIG.map((tab, ix) => {
            const selected = ix === selectedTab;
            return (
              <AppButton
                key={ix}
                plain
                style={{
                  flexGrow: 1,
                  borderBottom: selected ? '2px solid #337FBD' : 'none',
                }}
                onClick={() => setSelectedTab(ix)}>
                <Box height={'40px'} justify="center" align="center">
                  <Text
                    style={{
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: '500',
                      lineHeight: '18px',
                      color: selected ? '#337FBD' : '#6B7280',
                    }}>
                    {tab.label}
                  </Text>
                </Box>
              </AppButton>
            );
          })}
        </Box>

        <Box gap="medium">
          {posts.map((post, ix) => (
            <Box key={ix}>
              <PostCard post={post} shade={ix % 2 === 1} profile></PostCard>
            </Box>
          ))}
        </Box>
      </>
    );
  })();

  return <ViewportPage content={<Box fill>{content}</Box>}></ViewportPage>;
};

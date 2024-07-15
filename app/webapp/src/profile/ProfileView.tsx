import { Anchor, Box, Text } from 'grommet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { AppLogo } from '../app/brand/AppLogo';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCard } from '../post/PostCard';
import {
  AppPostFull,
  ProfilePostsQuery,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ProfileHeader } from './ProfileHeader';
import { TABS_CONFIG } from './TABS.CONFIG';

const DEBUG = true;

const PAGE_SIZE = 20;

/** extract the postId from the route and pass it to a PostContext */
export const ProfileView = (props: {
  username?: string;
  profile: TwitterUserProfile;
}) => {
  const profile = props.profile;

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
        const allPostsUnique = allPosts.filter(
          (p, ix, self) => self.findIndex((s) => s.id === p.id) === ix
        );
        return allPostsUnique;
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

  const navigate = useNavigate();
  const content = (() => {
    if (!username) {
      return (
        <Box gap="12px">
          <LoadingDiv height="125px" width="100%"></LoadingDiv>
          <Box>
            {[1, 2].map((ix) => (
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

    const postResults = (() => {
      if (!posts || isLoading) {
        return [1, 2].map((ix) => (
          <LoadingDiv
            key={ix}
            height="108px"
            width="100%"
            margin={{ bottom: '2px' }}></LoadingDiv>
        ));
      }

      if (posts.length === 0) {
        return (
          <BoxCentered fill>
            <Text>No posts found</Text>
          </BoxCentered>
        );
      }
      return posts.map((post, ix) => (
        <Box key={ix}>
          <PostCard
            post={post}
            shade={ix % 2 === 1}
            profile={profile}
            handleClick={() => {
              const path = `${location.pathname}/${post.id}`;
              navigate(path);
            }}></PostCard>
        </Box>
      ));
    })();

    return (
      <>
        <Box
          pad={{ top: 'medium' }}
          style={{ backgroundColor: constants.colors.shade, flexShrink: 0 }}>
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
          style={{ borderBottom: '1px solid  #D1D5DB', flexShrink: 0 }}>
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
                      textAlign: 'center',
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

        <Box gap="medium" fill>
          {postResults}
        </Box>
      </>
    );
  })();

  return <ViewportPage content={<Box fill>{content}</Box>}></ViewportPage>;
};

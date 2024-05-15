import { Anchor, Box, Text } from 'grommet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCard } from '../post/PostCard';
import { PLATFORM } from '../shared/types/types';
import {
  AppPostFull,
  ProfilePostsQuery,
  UserPostsQuery,
} from '../shared/types/types.posts';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ProfileHeader } from './ProfileHeader';

const DEBUG = true;

const PAGE_SIZE = 20;

/** extract the postId from the route and pass it to a PostContext */
export const ProfileView = (props: { username?: string }) => {
  const { constants } = useThemeContext();
  const username = props.username;

  const [posts, setPosts] = useState<AppPostFull[]>([]);
  const fetchedFirst = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetching, setIsFetching] = useState(false);
  const [errorFetching, setErrorFetching] = useState<Error>();

  const appFetch = useAppFetch();

  const labelsUris = ['https://sense-nets.xyz/announcesResource'];

  /** trigger the first fetch */
  useEffect(() => {
    if (posts.length === 0 && fetchedFirst.current === false) {
      fetchedFirst.current = true;
      if (DEBUG) console.log('first fetch');
      _fetchOlder(undefined);
    }
  }, [posts]);

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
    async (oldestPostId?: string) => {
      if (!username) {
        return;
      }

      if (DEBUG) console.log(`fetching for older`);
      setIsFetching(true);
      try {
        const params: ProfilePostsQuery = {
          platformId: PLATFORM.Twitter,
          username,
          labelsUris,
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
    if (DEBUG) console.log(`external fetchOlder`, _oldestPostId);
    _fetchOlder(_oldestPostId);
  }, [_fetchOlder, _oldestPostId]);

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

    const tabs = [
      {
        label: 'All',
        getPosts: () => {
          appFetch<AppPostFull[]>('/api/');
        },
      },
    ];

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
          <ProfileHeader
            pad={{
              top: '12px',
              horizontal: '12px',
              bottom: '16px',
            }}></ProfileHeader>
          <Box>{}</Box>
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

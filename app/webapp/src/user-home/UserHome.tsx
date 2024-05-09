import { Box, Menu, Text } from 'grommet';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { AbsoluteRoutes } from '../route.names';
import {
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isFetching, error, fetchOlder } = useUserPosts();

  useEffect(() => {
    if (error) {
      show({
        title: 'Error getting users posts',
      });
    }
  }, [error]);

  const navigate = useNavigate();

  const setFilter = (filter: UserPostsQueryParams) => {
    navigate(`/${filter.status}`);
  };

  if (error) {
    return <BoxCentered>{error.message}</BoxCentered>;
  }

  if (!posts || isFetching) {
    return <BoxCentered>Loading...</BoxCentered>;
  }

  return (
    <>
      <Menu
        label="Menu"
        items={[
          {
            label: 'All',
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.ALL,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: 'For Review',
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.PENDING,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: 'Ignored',
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.IGNORED,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: 'Published',
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.PUBLISHED,
                fetchParams: { expectedAmount: 10 },
              }),
          },
        ]}
      />
      <Box
        fill
        gap="large"
        pad={{ vertical: 'large', horizontal: 'medium' }}
        justify="start">
        {posts.length === 0 && (
          <BoxCentered>
            <Text>No posts found</Text>
          </BoxCentered>
        )}

        {posts.map((post, ix) => (
          <Box key={ix}>
            <PostContext postInit={post}>
              <PostCard></PostCard>
            </PostContext>
          </Box>
        ))}

        {!isFetching ? (
          <AppButton
            label="fetch older"
            onClick={() => fetchOlder()}></AppButton>
        ) : (
          <LoadingDiv></LoadingDiv>
        )}
      </Box>
    </>
  );
};

import { Box, Menu } from 'grommet';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { AbsoluteRoutes } from '../route.names';
import { PostsQueryStatusParam } from '../shared/types/types.posts';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isLoading, error } = useUserPosts();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      show({
        title: 'Error getting users posts',
      });
    }
  }, [error]);

  if (error) {
    return <BoxCentered>{error.message}</BoxCentered>;
  }

  if (!posts || isLoading) {
    return <BoxCentered>Loading...</BoxCentered>;
  }

  if (posts.length === 0) {
    return <BoxCentered>No posts found</BoxCentered>;
  }

  return (
    <>
      <Menu
        label="Menu"
        items={[
          {
            label: 'All',
            onClick: () =>
              navigate(
                `${AbsoluteRoutes.Posts}?status=${PostsQueryStatusParam.ALL}`
              ),
          },
          {
            label: 'For Review',
            onClick: () =>
              navigate(
                `${AbsoluteRoutes.Posts}?status=${PostsQueryStatusParam.FOR_REVIEW}`
              ),
          },
          {
            label: 'Ignored',
            onClick: () =>
              navigate(
                `${AbsoluteRoutes.Posts}?status=${PostsQueryStatusParam.IGNORED}`
              ),
          },
          {
            label: 'Published',
            onClick: () =>
              navigate(
                `${AbsoluteRoutes.Posts}?status=${PostsQueryStatusParam.PUBLISHED}`
              ),
          },
        ]}
      />
      <Box
        fill
        gap="large"
        pad={{ vertical: 'large', horizontal: 'medium' }}
        justify="start">
        {posts.map((post, ix) => (
          <Box key={ix}>
            <PostContext postInit={post}>
              <PostCard></PostCard>
            </PostContext>
          </Box>
        ))}
      </Box>
    </>
  );
};

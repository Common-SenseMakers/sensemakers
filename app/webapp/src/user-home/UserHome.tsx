import { Box, Menu, Text } from 'grommet';
import { useEffect } from 'react';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { PostsQueryStatusParam } from '../shared/types/types.posts';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isLoading, error, setFilter } = useUserPosts();

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

  return (
    <>
      <Menu
        label="Menu"
        items={[
          {
            label: 'All',
            onClick: () => setFilter({ status: PostsQueryStatusParam.ALL }),
          },
          {
            label: 'For Review',
            onClick: () =>
              setFilter({ status: PostsQueryStatusParam.FOR_REVIEW }),
          },
          {
            label: 'Ignored',
            onClick: () => setFilter({ status: PostsQueryStatusParam.IGNORED }),
          },
          {
            label: 'Published',
            onClick: () =>
              setFilter({ status: PostsQueryStatusParam.PUBLISHED }),
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
      </Box>
    </>
  );
};

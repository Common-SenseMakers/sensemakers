import { Box } from 'grommet';
import { useEffect } from 'react';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isLoading, error } = useUserPosts();

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
  );
};

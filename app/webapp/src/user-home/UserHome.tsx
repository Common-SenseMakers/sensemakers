import { Box } from 'grommet';
import { useEffect } from 'react';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
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

  if (!posts || isLoading) {
    return <Box>Loading...</Box>;
  }

  if (posts.length === 0) {
    return <Box>No posts found</Box>;
  }

  console.log({ posts });

  return (
    <Box
      gap="large"
      pad={{ vertical: 'large', horizontal: 'small' }}
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

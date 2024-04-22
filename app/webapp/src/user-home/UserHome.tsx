import { Box } from 'grommet';
import { useEffect } from 'react';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isFetching, error } = useUserPosts();

  useEffect(() => {
    if (error) {
      show({
        title: 'Error getting users posts',
      });
    }
  }, [error]);

  if (!posts || isFetching) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box>
      {posts.map((post, ix) => (
        <Box>
          <PostContext postInit={post}>
            <PostCard></PostCard>
          </PostContext>
        </Box>
      ))}
    </Box>
  );
};

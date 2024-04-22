import { Box } from 'grommet';

import { PostCard } from '../post/PostCard';
import { PostContext } from '../post/PostContext';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { posts, isFetching } = useUserPosts();

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

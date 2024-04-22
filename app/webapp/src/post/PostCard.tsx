import { Box } from 'grommet';

import { usePost } from '../post/PostContext';

export const PostCard = () => {
  const { post } = usePost();

  return (
    <Box pad="medium" style={{ border: '2px solid', borderRadius: '4px' }}>
      <Box>{post?.content}</Box>
    </Box>
  );
};

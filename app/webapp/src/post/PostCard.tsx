import { Box } from 'grommet';

import { usePost } from '../post/PostContext';

export const PostCard = () => {
  const { post } = usePost();

  return <Box>{post?.content}</Box>;
};

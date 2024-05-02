import { Box, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { AppPostFull } from '../shared/types/types.posts';
import { usePost } from './PostContext';

export const PostContent = () => {
  const navigate = useNavigate();
  const { post } = usePost();
  return (
    <Box pad="medium" elevation="small">
      <Box pad={{ vertical: 'small' }}>
        <Text>{post?.content}</Text>
      </Box>
      <Box>
        <Text size="xsmall">{post?.semantics}</Text>
      </Box>
    </Box>
  );
};

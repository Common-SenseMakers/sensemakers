import { Box, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { AppPostFull } from '../shared/types/types.posts';

export const PostContent: React.FC<{ post: AppPostFull }> = ({ post }) => {
  const navigate = useNavigate();
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

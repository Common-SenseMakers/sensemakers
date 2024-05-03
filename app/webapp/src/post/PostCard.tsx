import { Box, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { AppIcon } from '../app/icons/AppIcon';
import { usePost } from '../post/PostContext';
import { Loading } from '../ui-components/LoadingDiv';

export const PostCard = () => {
  const { post } = usePost();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${post?.id}`);
  };

  const processed = post && post.parsedStatus === 'processed';

  return (
    <Box
      pad="medium"
      style={{
        cursor: 'pointer',
        position: 'relative',
      }}
      elevation="small"
      onClick={handleClick}>
      <Text size="medium">{post?.content}</Text>
      <Box style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
        {processed ? <AppIcon></AppIcon> : <Loading></Loading>}
      </Box>
    </Box>
  );
};

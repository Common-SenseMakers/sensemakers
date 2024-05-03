import { Box, Text } from 'grommet';
import { StatusGood } from 'grommet-icons';
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
        border: '2px solid',
        borderRadius: '4px',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}>
      <Text size="medium">{post?.content}</Text>
      <Box style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
        {processed ? <AppIcon></AppIcon> : <Loading></Loading>}
      </Box>
    </Box>
  );
};

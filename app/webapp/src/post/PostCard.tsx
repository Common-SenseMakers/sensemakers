import { Box } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { usePost } from '../post/PostContext';

export const PostCard = () => {
  const { post } = usePost();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${post?.id}`);
  };

  return (
    <Box
      pad="medium"
      style={{ border: '2px solid', borderRadius: '4px', cursor: 'pointer' }}
      onClick={handleClick}>
      <Box>{post?.content}</Box>
      <Box>{post?.parseStatus}</Box>
    </Box>
  );
};

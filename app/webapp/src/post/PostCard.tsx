import { Box, Text } from 'grommet';
import { StatusCritical } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

import { AppIcon } from '../app/icons/AppIcon';
import { usePost } from '../post/PostContext';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PostText } from './PostText';

export const PostCard = () => {
  const { post } = usePost();
  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const handleClick = () => {
    navigate(`/post/${post?.id}`);
  };

  const processStatusIcon = (() => {
    const processed = post && post.parsedStatus === 'processed';
    const processing = post && post.parsingStatus === 'processing';
    const errored = post && post.parsingStatus === 'errored';

    if (processed) return <AppIcon src="network.svg"></AppIcon>;
    if (processing) return <Loading></Loading>;
    if (errored) return <StatusCritical></StatusCritical>;
  })();

  return (
    <Box
      pad="medium"
      style={{
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: constants.colors.backgroundLight,
      }}
      elevation="small"
      onClick={handleClick}>
      <PostText text={post?.content}></PostText>
      <Box style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
        {processStatusIcon}
      </Box>
    </Box>
  );
};

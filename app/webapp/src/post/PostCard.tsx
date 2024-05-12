import { Box, Text } from 'grommet';
import { StatusCritical } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

import { AppIcon } from '../app/brand/AppIcon';
import { AppPostFull, AppPostParsingStatus } from '../shared/types/types.posts';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PostText } from './PostText';

export const PostCard = (props: { post: AppPostFull; shade?: boolean }) => {
  const { post, shade: _shade } = props;
  const shade = _shade || false;
  const isParsing = post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  const processStatusIcon = (() => {
    const processed = post && post.parsedStatus === 'processed';
    const errored = post && post.parsingStatus === 'errored';

    if (isParsing) return <Loading></Loading>;
    if (processed) return <AppIcon></AppIcon>;
    if (errored) return <StatusCritical></StatusCritical>;
  })();

  return (
    <Box
      pad="medium"
      style={{
        backgroundColor: shade ? '#D1D5DB' : 'white',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}>
      <Box direction="row" justify="between">
        <Text size="xsmall">{post?.id}</Text>
        <Text size="small">{post?.reviewedStatus}</Text>
      </Box>
      <PostText truncate text={post?.content}></PostText>
    </Box>
  );
};

import { Box } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { PLATFORM } from '../shared/types/types';
import { AppPostFull } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus, StatusTag } from './NanopubStatus';
import { PostText } from './PostText';

export const PostCard = (props: { post: AppPostFull; shade?: boolean }) => {
  const { post, shade: _shade } = props;
  const shade = _shade || false;

  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);

  return (
    <Box
      pad={{ top: 'medium', bottom: 'large', horizontal: 'medium' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}>
      <Box direction="row" justify="between">
        <TweetAnchor
          thread={tweet?.posted?.post}
          timestamp={tweet?.posted?.timestampMs}></TweetAnchor>
        <NanopubStatus post={post}></NanopubStatus>
      </Box>
      <PostText truncate shade={shade} text={post?.content}></PostText>
    </Box>
  );
};

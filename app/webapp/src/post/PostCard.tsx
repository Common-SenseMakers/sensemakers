import { Box } from 'grommet';
import { useLocation, useNavigate } from 'react-router-dom';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { PostText } from './PostText';
import { concatenateThread } from './posts.helper';

export const PostCard = (props: {
  post: AppPostFull;
  shade?: boolean;
  profile?: TwitterUserProfile;
}) => {
  const { post, shade: _shade } = props;
  const profile = props.profile;
  const shade = _shade || false;

  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const location = useLocation();

  const handleClick = () => {
    const path = profile
      ? `${location.pathname}/${post.id}`
      : `/post/${post.id}`;
    navigate(path);
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
        {!profile ? <NanopubStatus post={post}></NanopubStatus> : <></>}
      </Box>
      <PostText
        truncate
        shade={shade}
        text={concatenateThread(post.generic)}></PostText>

      <SemanticsEditor
        include={[PATTERN_ID.REF_LABELS]}
        isLoading={false}
        patternProps={{
          editable: false,
          semantics: post?.semantics,
          originalParsed: post?.originalParsed,
        }}></SemanticsEditor>
    </Box>
  );
};

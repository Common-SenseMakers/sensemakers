import { Box } from 'grommet';

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
  handleClick: () => void;
}) => {
  const { post, shade: _shade } = props;
  const profile = props.profile;
  const shade = _shade || false;

  const { constants } = useThemeContext();

  const handleClick = props.handleClick;
  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);

  return (
    <Box
      pad={{ top: '16px', bottom: '24px', horizontal: '12px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderTop: '1px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
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
      <SemanticsEditor
        include={[PATTERN_ID.KEYWORDS]}
        isLoading={false}
        patternProps={{
          editable: false,
          semantics: post?.semantics,
          originalParsed: post?.originalParsed,
        }}></SemanticsEditor>
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

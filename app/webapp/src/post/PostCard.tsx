import { Box } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { SciFilterClassfication } from '../shared/types/types.parser';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { PostTextStatic } from './PostTextStatic';
import {
  concatenateThread,
  getPostStatuses,
  hideSemanticsHelper,
} from './posts.helper';

export const PostCard = (props: {
  post: AppPostFull;
  shade?: boolean;
  profile?: TwitterUserProfile;
  handleClick: () => void;
  isEmail?: boolean;
}) => {
  const { post, shade: _shade, isEmail } = props;
  const profile = props.profile;
  const shade = _shade || false;

  const { constants } = useThemeContext();

  const handleClick = () => {
    props.handleClick();
  };

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const postText = concatenateThread(post.generic);

  const { isParsing } = getPostStatuses(post);

  const handleInternalClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };

  const hideSemantics = hideSemanticsHelper(post);

  return (
    <Box
      pad={{ top: '16px', bottom: '24px', horizontal: '12px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderTop: '2px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
        borderBottom: 'none',
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

      {!hideSemantics && (
        <SemanticsEditor
          include={[PATTERN_ID.KEYWORDS]}
          patternProps={{
            isLoading: isParsing !== undefined ? isParsing : false,
            editable: false,
            size: 'compact',
            semantics: post?.semantics,
            originalParsed: post?.originalParsed,
          }}></SemanticsEditor>
      )}

      <PostTextStatic
        onClick={handleInternalClick}
        truncate
        shade={shade}
        text={postText}></PostTextStatic>

      {!hideSemantics && (
        <SemanticsEditor
          include={[PATTERN_ID.REF_LABELS]}
          patternProps={{
            isLoading: isParsing !== undefined ? isParsing : false,
            size: 'compact',
            editable: false,
            semantics: post?.semantics,
            originalParsed: post?.originalParsed,
          }}></SemanticsEditor>
      )}
    </Box>
  );
};

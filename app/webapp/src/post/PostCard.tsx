import { Box } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { ClearIcon } from '../app/icons/ClearIcon';
import { CheckIcon } from '../app/icons/FilterIcon copy';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { SciFilterClassfication } from '../shared/types/types.parser';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { PostTextStatic } from './PostTextStatic';
import { usePost } from './post.context/PostContext';
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

  const { updated, publish } = usePost();

  const handleInternalClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };

  const hideSemantics = hideSemanticsHelper(post);

  return (
    <Box
      pad={{ top: '16px', horizontal: '12px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderTop: '2px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
        borderBottom: 'none',
      }}>
      <Box
        style={{ cursor: 'pointer', position: 'relative' }}
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
              isLoading:
                updated.statusesMerged.isParsing !== undefined
                  ? updated.statusesMerged.isParsing
                  : false,
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
              isLoading:
                updated.statusesMerged.isParsing !== undefined
                  ? updated.statusesMerged.isParsing
                  : false,
              size: 'compact',
              editable: false,
              semantics: post?.semantics,
              originalParsed: post?.originalParsed,
            }}></SemanticsEditor>
        )}
      </Box>
      <Box
        direction="row"
        justify="end"
        gap="16px"
        align="center"
        pad={{ bottom: '12px' }}>
        <AppButton
          plain
          icon={<ClearIcon size={38}></ClearIcon>}
          onClick={() => publish.ignorePost()}></AppButton>
        <AppButton
          plain
          disabled={!updated.readyToNanopublish}
          icon={<CheckIcon size={38}></CheckIcon>}
          onClick={() => publish.setPublishIntent(true)}></AppButton>
      </Box>
    </Box>
  );
};

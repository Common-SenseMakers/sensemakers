import { Box } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { PublishButtons } from './PostPublishButtons';
import { PostTextStatic } from './PostTextStatic';
import { usePost } from './post.context/PostContext';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

export const PostCard = (props: {
  shade?: boolean;
  handleClick: () => void;
  isEmail?: boolean;
}) => {
  const { shade: _shade } = props;
  const shade = _shade || false;

  const { updated } = usePost();
  const post = updated.postMerged;

  const { constants } = useThemeContext();

  if (!post) {
    console.warn('unexpected post undefined in PostCard');
    return <></>;
  }

  const handleClick = () => {
    props.handleClick();
  };

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const postText = concatenateThread(post.generic);

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
          <NanopubStatus post={post}></NanopubStatus>
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
      <Box pad={{ top: 'medium' }}>
        {updated.inPrePublish && <PublishButtons compact></PublishButtons>}
      </Box>
    </Box>
  );
};

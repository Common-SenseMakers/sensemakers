import { Box, Text } from 'grommet';

import { PlatformPostAnchor } from '../app/anchors/PlatformPostAnchor';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PublishButtons } from './PostPublishButtons';
import { PostTextStatic } from './PostTextStatic';
import { getPostDetails } from './platform.post.details';
import { usePost } from './post.context/PostContext';
import { concatenateThread } from './posts.helper';

const PostCardHeader = (props: { post: AppPostFull }) => {
  const { constants } = useThemeContext();
  const details = getPostDetails(props.post);

  return (
    <Box direction="row" align="center" justify="between" width="100%">
      <Box direction="row" align="center" gap="4px">
        <PlatformAvatar
          size={24}
          imageUrl={details?.authorAvatarUrl}></PlatformAvatar>
        <Box direction="row" justify="between">
          <Text
            color={constants.colors.grayIcon}
            style={{
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '16px',
              textDecoration: 'none',
            }}>
            {details?.authorName}
          </Text>
        </Box>
      </Box>
      <Box>
        <PlatformPostAnchor details={details}></PlatformPostAnchor>
      </Box>
    </Box>
  );
};

export const PostCard = (props: {
  isPublicFeed?: boolean;
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

  const postText = concatenateThread(post.generic);

  const handleInternalClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };

  const hideSemantics = false;

  const header = <PostCardHeader post={post}></PostCardHeader>;

  return (
    <Box
      pad={{ top: '16px', horizontal: '12px', bottom: '16px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderBottom: '1px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
        borderTop: 'none',
      }}>
      <Box
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={handleClick}>
        {false && (
          <Box direction="row" justify="between" margin={{ bottom: '6.5px' }}>
            <PublishButtons></PublishButtons>
          </Box>
        )}

        <Box direction="row" justify="between" margin={{ bottom: '6.5px' }}>
          {header}
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
          <Box>
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
          </Box>
        )}
      </Box>
    </Box>
  );
};

import { Box, Text } from 'grommet';
import { MouseEventHandler } from 'react';

import { Autoindexed } from '../app/icons/Autoindexed';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { useOverlay } from '../overlays/OverlayContext';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID, PostClickTarget } from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PlatformPostAnchor } from './PlatformPostAnchor';
import { PublishButtons } from './PostPublishButtons';
import { PostTextStatic } from './PostTextStatic';
import { getPostDetails } from './platform-specific.details';
import { usePost } from './post.context/PostContext';
import { concatenateThread } from './posts.helper';

const KEYWORDS_SEMANTICS_ID = 'keywords-semantics';
const REFS_SEMANTICS_ID = 'refs-semantics';
const POST_AUTHOR_ID = 'post-author';

export const CARD_BORDER = '1px solid var(--Neutral-300, #D1D5DB)';

const PostCardHeader = (props: {
  post: AppPostFull;
  onBlankClick?: () => void;
}) => {
  const { constants } = useThemeContext();
  const details = getPostDetails(props.post);
  const onBlankClick = props.onBlankClick;
  const isAutoIndexed = props.post.authorUserId === null;

  const overlay = useOverlay();

  const onUserClicked = () => {
    if (props.post.authorUserId) {
      overlay &&
        overlay.onPostClick({
          target: PostClickTarget.USER_ID,
          payload: props.post.authorUserId,
        });
      return;
    }

    if (props.post.authorProfileId) {
      overlay &&
        overlay.onPostClick({
          target: PostClickTarget.PLATFORM_USER_ID,
          payload: props.post.authorProfileId,
        });
      return;
    }
  };

  return (
    <Box
      direction="row"
      align="center"
      width="100%"
      style={{ overflow: 'hidden' }}>
      <Box
        direction="row"
        align="center"
        gap="4px"
        onClick={() => onUserClicked()}
        style={{ flexShrink: 0 }}>
        <PlatformAvatar
          size={24}
          imageUrl={details?.authorAvatarUrl}></PlatformAvatar>
        <Box direction="row" justify="between" gap="8px" align="center">
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
          {isAutoIndexed && <Autoindexed></Autoindexed>}
        </Box>
      </Box>
      <Box
        style={{ flexGrow: 1, height: '100%' }}
        onClick={() => onBlankClick && onBlankClick()}></Box>
      <Box>
        <PlatformPostAnchor details={details}></PlatformPostAnchor>
      </Box>
    </Box>
  );
};

export const PostCard = (props: {
  isPublicFeed?: boolean;
  shade?: boolean;
  isEmail?: boolean;
}) => {
  const { shade: _shade } = props;
  const shade = _shade || false;

  const { updated } = usePost();
  const post = updated.postMerged;

  const { constants } = useThemeContext();

  const overlay = useOverlay();

  if (!post) {
    console.warn('unexpected post undefined in PostCard');
    return <></>;
  }

  const onPostClick = () => {
    overlay &&
      overlay.onPostClick({ target: PostClickTarget.POST, payload: post });
  };

  const handleClick: MouseEventHandler = (event) => {
    let target = event.target as HTMLElement;

    // filter clicks on the ref semantics
    while (target !== null) {
      if (
        [REFS_SEMANTICS_ID, POST_AUTHOR_ID, KEYWORDS_SEMANTICS_ID].includes(
          target.id
        )
      ) {
        return; // Stop further processing
      }

      target = target.parentNode as HTMLElement;
    }

    onPostClick();
  };

  const postText = concatenateThread(post.generic);
  const postTextTruncated = postText.slice(0, 700) + '...';

  const handleInternalClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };

  const hideSemantics = false;

  return (
    <Box
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderBottom: CARD_BORDER,
        borderRight: CARD_BORDER,
        borderLeft: CARD_BORDER,
        borderTop: 'none',
      }}>
      <PublishButtons></PublishButtons>

      <Box pad={{ top: '16px', horizontal: '12px', bottom: '24px' }}>
        <Box
          style={{ cursor: 'pointer', position: 'relative' }}
          onClick={handleClick}>
          <Box
            id={POST_AUTHOR_ID}
            direction="row"
            justify="between"
            margin={{ bottom: '16px' }}>
            <PostCardHeader
              onBlankClick={() => onPostClick()}
              post={post}></PostCardHeader>
          </Box>
          {!hideSemantics && (
            <Box id={KEYWORDS_SEMANTICS_ID}>
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
                  structuredSemantics: post?.structuredSemantics,
                  onNonSemanticsClick: () => onPostClick(),
                }}></SemanticsEditor>
            </Box>
          )}
          <PostTextStatic
            onClick={handleInternalClick}
            truncate
            shade={shade}
            text={postTextTruncated}></PostTextStatic>
          {!hideSemantics && (
            <Box margin={{ top: '24px' }} id={REFS_SEMANTICS_ID}>
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
                  structuredSemantics: post?.structuredSemantics,
                  post,
                }}></SemanticsEditor>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

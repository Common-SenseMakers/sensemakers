import { Box, BoxExtendedProps, Text } from 'grommet';

import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { useOverlay } from '../overlays/OverlayContext';
import { PlatformPostAnchor } from '../post/PlatformPostAnchor';
import { PostClickTarget } from '../semantics/patterns/patterns';
import { useThemeContext } from '../ui-components/ThemedApp';
import { getPostDetails } from './platform-specific.details';
import { usePost } from './post.context/PostContext';

/** should be used inside a PostContext */
export const PostHeader = (props: { boxProps: BoxExtendedProps }) => {
  const { constants } = useThemeContext();
  const { updated } = usePost();
  const { onPostClick } = useOverlay();

  const post = updated.postMerged;

  const { boxProps } = props;

  const details = getPostDetails(post);

  const onUserClicked = () => {
    if (!post) return;

    if (post.authorUserId) {
      onPostClick({
        target: PostClickTarget.USER_ID,
        payload: post.authorUserId,
      });
      return;
    }

    if (post.authorProfileId) {
      onPostClick({
        target: PostClickTarget.PLATFORM_USER_ID,
        payload: post.authorProfileId,
      });
      return;
    }
  };

  return (
    <Box direction="row" justify="between" {...boxProps}>
      <Box direction="row">
        <div style={{ cursor: 'pointer' }} onClick={() => onUserClicked()}>
          <PlatformAvatar
            size={48}
            imageUrl={details?.authorAvatarUrl}></PlatformAvatar>
        </div>
        <Box width="100%" margin={{ left: 'medium' }}>
          <Box direction="row" justify="between">
            <Text
              color={constants.colors.primary}
              style={{
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: '18px',
                textDecoration: 'none',
              }}>
              {details?.authorName}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <PlatformPostAnchor
            loading={post === undefined}
            details={details}></PlatformPostAnchor>
        </Box>
      </Box>
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';

import { Autoindexed } from '../app/icons/Autoindexed';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { useOverlay } from '../overlays/OverlayContext';
import { PlatformPostAnchor } from '../post/PlatformPostAnchor';
import { PostClickTarget } from '../semantics/patterns/patterns';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { getPostDetails } from './platform-specific.details';
import { usePost } from './post.context/PostContext';

/** should be used inside a PostContext */
export const PostHeader = (props: {
  boxProps: BoxExtendedProps;
  showLoading: boolean;
}) => {
  const { constants } = useThemeContext();
  const { updated } = usePost();
  const overlay = useOverlay();

  const post = updated.postMerged;
  const isAutoIndexed = post?.authorUserId === undefined;

  const { boxProps } = props;

  const details = getPostDetails(post);

  const onUserClicked = () => {
    if (!post) return;

    if (post.authorUserId) {
      overlay &&
        overlay.onPostClick({
          target: PostClickTarget.USER_ID,
          payload: post.authorUserId,
        });
      return;
    }

    if (post.authorProfileId) {
      overlay &&
        overlay.onPostClick({
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
          <Box direction="row" justify="start" gap="8px" align="center">
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
            {isAutoIndexed && <Autoindexed></Autoindexed>}
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <PlatformPostAnchor
            loading={post === undefined}
            details={details}></PlatformPostAnchor>
        </Box>
      </Box>
      {props.showLoading && (
        <Box pad={{ horizontal: 'medium' }}>
          <Loading size="14px"></Loading>
        </Box>
      )}
    </Box>
  );
};

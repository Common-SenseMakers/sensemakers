import { Box, BoxExtendedProps, Text } from 'grommet';

import { PlatformPostAnchor } from '../app/anchors/PlatformPostAnchor';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { MastodonUserProfile } from '../shared/types/types.mastodon';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AccountDetailsRead, PLATFORM } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { usePost } from './post.context/PostContext';

export const PostHeader = (props: {
  boxProps: BoxExtendedProps;
  name: string;
  imageUrl?: string;
}) => {
  const { constants } = useThemeContext();
  const { updated } = usePost();
  const post = updated.postMerged;

  const { boxProps, name, imageUrl } = props;

  const originalPlatformPost = post?.mirrors.find(
    (m) => m.platformId === post.origin
  );
  const originalPostUrl = post?.generic.thread[0].url;

  return (
    <Box direction="row" justify="between" {...boxProps}>
      <Box direction="row">
        <PlatformAvatar size={48} profileImageUrl={imageUrl}></PlatformAvatar>
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
              {name}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <PlatformPostAnchor
            platformPostPosted={originalPlatformPost?.posted}
            platformId={post?.origin}
            postUrl={originalPostUrl}></PlatformPostAnchor>
        </Box>
      </Box>

      <Box gap="small" align="end">
        <NanopubStatus post={updated.postMerged}></NanopubStatus>
      </Box>
    </Box>
  );
};

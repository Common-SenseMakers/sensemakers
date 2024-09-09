import { Box, BoxExtendedProps, Text } from 'grommet';
import { Clear, Edit, Send } from 'grommet-icons';

import { PlatformPostAnchor } from '../app/anchors/PlatformPostAnchor';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { SendIcon } from '../app/icons/SendIcon';
import { MastodonUserProfile } from '../shared/types/types.mastodon';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AccountDetailsRead, PLATFORM } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus, StatusTag } from './NanopubStatus';
import { usePost } from './PostContext';

export const PostHeader = (
  props: BoxExtendedProps & { profile?: AccountDetailsRead<any> }
) => {
  const { constants } = useThemeContext();
  const { post } = usePost();
  const originalPlatformPost = post?.mirrors.find(
    (m) => m.platformId === post.origin
  );
  const originalPostUrl = post?.generic.thread[0].url;

  const name = post?.generic.author.name;
  const profileImageUrl = (() => {
    if (post?.origin === PLATFORM.Twitter) {
      return (props.profile?.profile as TwitterUserProfile)?.profile_image_url;
    }
    if (post?.origin === PLATFORM.Mastodon) {
      return (props.profile?.profile as MastodonUserProfile)?.avatar;
    }
    return undefined;
  })();

  return (
    <Box direction="row" justify="between" {...props}>
      <Box direction="row">
        <PlatformAvatar
          size={48}
          profileImageUrl={profileImageUrl}></PlatformAvatar>
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
        <NanopubStatus post={post}></NanopubStatus>
      </Box>
    </Box>
  );
};

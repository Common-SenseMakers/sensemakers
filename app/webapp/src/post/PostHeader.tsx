import { Box, BoxExtendedProps, Text } from 'grommet';
import { Clear, Edit, Send } from 'grommet-icons';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { SendIcon } from '../app/icons/SendIcon';
import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus, StatusTag } from './NanopubStatus';
import { usePost } from './PostContext';

export const PostHeader = (
  props: BoxExtendedProps & { profile?: TwitterUserProfile }
) => {
  const { constants } = useThemeContext();
  const { tweet, post, setEnabledEdit, editable } = usePost();

  const username = props.profile?.name;

  return (
    <Box direction="row" justify="between" {...props}>
      <Box direction="row">
        <TwitterAvatar size={48} profile={props.profile}></TwitterAvatar>
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
              {username}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <TweetAnchor thread={tweet?.posted?.post}></TweetAnchor>
        </Box>
      </Box>

      <Box gap="small" align="end">
        <NanopubStatus post={post}></NanopubStatus>
      </Box>
    </Box>
  );
};

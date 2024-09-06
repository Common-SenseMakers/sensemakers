import { Box, BoxExtendedProps, Text } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { usePost } from './PostContext';

export const PostHeader = (props: BoxExtendedProps) => {
  const { constants } = useThemeContext();
  const { derived, merged } = usePost();

  const profile = derived.tweet?.posted?.author;

  return (
    <Box direction="row" justify="between" {...props}>
      <Box direction="row">
        <TwitterAvatar size={48} profile={profile}></TwitterAvatar>
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
              {profile.name}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <TweetAnchor
            thread={derived.tweet?.posted?.post}
            timestamp={derived.tweet?.posted?.timestampMs}></TweetAnchor>
        </Box>
      </Box>

      <Box gap="small" align="end">
        <NanopubStatus post={merged.post}></NanopubStatus>
      </Box>
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { usePost } from './PostContext';

export const PostHeader = (
  props: BoxExtendedProps & { profile?: TwitterUserProfile; isProfile: boolean }
) => {
  const { constants } = useThemeContext();
  const { tweet, post } = usePost();

  const username = props.profile?.name;

  return (
    <Box direction="row" {...props}>
      <TwitterAvatar size={40} profile={props.profile}></TwitterAvatar>
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
          {!props.isProfile ? (
            <NanopubStatus post={post}></NanopubStatus>
          ) : (
            <></>
          )}
        </Box>
        <Box margin={{ bottom: '6px' }}></Box>
        <TweetAnchor thread={tweet?.posted?.post}></TweetAnchor>
      </Box>
    </Box>
  );
};

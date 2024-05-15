import { Box, BoxExtendedProps, Text } from 'grommet';

import { TwitterAvatar } from '../app/TwitterAvatar';
import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { NanopubStatus } from './NanopubStatus';
import { usePost } from './PostContext';

export const PostHeader = (props: BoxExtendedProps & { profile?: boolean }) => {
  const profile = props.profile !== undefined ? props.profile : false;
  const { constants } = useThemeContext();
  const { twitterProfile } = useAccountContext();
  const { tweet, post } = usePost();

  const username = twitterProfile?.name;

  return (
    <Box direction="row" {...props}>
      <TwitterAvatar size={40} profile={twitterProfile}></TwitterAvatar>
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
          {!profile ? <NanopubStatus post={post}></NanopubStatus> : <></>}
        </Box>
        <Box margin={{ bottom: '6px' }}></Box>
        <TweetAnchor thread={tweet?.posted?.post}></TweetAnchor>
      </Box>
    </Box>
  );
};

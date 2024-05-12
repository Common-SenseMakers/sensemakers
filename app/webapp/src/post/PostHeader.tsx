import { Box, Text } from 'grommet';

import { TwitterAvatar } from '../app/TwitterAvatar';
import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { usePost } from './PostContext';

export const PostHeader = (props: {}) => {
  const { constants } = useThemeContext();
  const { twitterProfile } = useAccountContext();
  const { tweet } = usePost();

  const username = twitterProfile?.name;

  return (
    <Box direction="row">
      <TwitterAvatar size={40} profile={twitterProfile}></TwitterAvatar>
      <Box margin={{ left: 'medium' }}>
        <Box margin={{ bottom: '6px' }}>
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
        <TweetAnchor thread={tweet?.posted?.post}></TweetAnchor>
      </Box>
    </Box>
  );
};

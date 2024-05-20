import { Box, BoxExtendedProps, Text } from 'grommet';
import { useQuery } from 'wagmi/dist/types/utils/query';

import { TwitterAvatar } from '../app/TwitterAvatar';
import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { useProfileContext } from '../profile/ProfileContext';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
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

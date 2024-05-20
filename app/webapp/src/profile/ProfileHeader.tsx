import { Box, BoxExtendedProps, Text } from 'grommet';

import { TwitterAvatar } from '../app/TwitterAvatar';
import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useProfileContext } from './ProfileContext';

export const ProfileHeader = (props: BoxExtendedProps) => {
  const { constants } = useThemeContext();
  const { profile } = useProfileContext();

  const name = profile?.name;
  const username = profile?.username;

  return (
    <Box direction="row" {...props}>
      <TwitterAvatar size={60} profile={profile}></TwitterAvatar>
      <Box width="100%" margin={{ left: 'medium' }}>
        <Box>
          <Text
            color={constants.colors.primary}
            style={{
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: '24px',
              textDecoration: 'none',
            }}>
            {name}
          </Text>
        </Box>
        <Box>
          <Text
            color={constants.colors.primary}
            style={{
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '18px',
              textDecoration: 'none',
              color: '#337FBD',
            }}>
            @{username}
          </Text>
        </Box>
        <Box margin={{ bottom: '6px' }}></Box>
      </Box>
    </Box>
  );
};

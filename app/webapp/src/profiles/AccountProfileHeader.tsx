import { Box, BoxExtendedProps, Text } from 'grommet';

import { Autoindexed } from '../app/icons/Autoindexed';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { useThemeContext } from '../ui-components/ThemedApp';
import { AccountProfileAnchor } from './AccountProfileAnchor';

export const AccountProfileHeader = (props: {
  account?: AccountProfileRead;
  boxProps?: BoxExtendedProps;
}) => {
  const { constants } = useThemeContext();

  const { account, boxProps } = props;
  const profile = account?.profile;

  return (
    <Box direction="row" align="center" gap="8px" {...boxProps}>
      <PlatformAvatar size={48} imageUrl={profile?.avatar}></PlatformAvatar>
      <Box gap="4px">
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
            {profile?.displayName}
          </Text>
          <Autoindexed showInfo></Autoindexed>
        </Box>
        <Text
          color={constants.colors.primary}
          style={{
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '18px',
            textDecoration: 'none',
          }}></Text>
        <AccountProfileAnchor account={account}></AccountProfileAnchor>
      </Box>
    </Box>
  );
};

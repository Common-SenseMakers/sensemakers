import { Box, BoxExtendedProps, Text } from 'grommet';
import { useMemo } from 'react';

import { Autoindexed } from '../app/icons/Autoindexed';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { useThemeContext } from '../ui-components/ThemedApp';
import { AccountProfileAnchor } from './AccountProfileAnchor';

export const AccountProfileHeader = (props: {
  accounts: AccountProfileRead[];
  boxProps?: BoxExtendedProps;
}) => {
  const { constants } = useThemeContext();

  const { accounts, boxProps } = props;

  const { avatar, displayName } = useMemo(() => {
    let _avatar: string | undefined = undefined;
    let _displayName: string | undefined = undefined;

    for (const account of accounts) {
      if (account.profile && account.profile.avatar) {
        _avatar = account.profile.avatar;
      }
      if (account.profile && account.profile.displayName) {
        _displayName = account.profile.displayName;
      }
    }

    return {
      avatar: _avatar,
      displayName: _displayName,
    };
  }, [accounts]);

  return (
    <Box direction="row" align="center" justify="between" {...boxProps}>
      <Box direction="row" align="center" gap="8px">
        <PlatformAvatar size={44} imageUrl={avatar}></PlatformAvatar>

        <Box gap="4px">
          <Box style={{ flexShrink: 0 }}>
            <Text
              color={constants.colors.grayIcon}
              style={{
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '24px',
                textDecoration: 'none',
                letterSpacing: '-0.36px',
              }}>
              {displayName}
            </Text>
          </Box>

          <Box direction="row" align="center" gap="12px">
            <Box direction="row" align="center" gap="12px">
              {accounts.map((account, ix) => (
                <AccountProfileAnchor
                  key={ix}
                  account={account}></AccountProfileAnchor>
              ))}
            </Box>

            <Autoindexed showInfo></Autoindexed>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

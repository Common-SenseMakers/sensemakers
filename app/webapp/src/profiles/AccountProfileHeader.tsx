import { Box, BoxExtendedProps, Text } from 'grommet';
import { useMemo } from 'react';

import { Autoindexed } from '../app/icons/Autoindexed';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { useThemeContext } from '../ui-components/ThemedApp';
import { AccountProfileAnchor } from './AccountProfileAnchor';

export const AccountProfileHeader = (props: {
  autoIndexed?: boolean;
  accounts: AccountProfileRead[];
  boxProps?: BoxExtendedProps;
  size?: 'small' | 'medium';
}) => {
  const { constants } = useThemeContext();
  const size = props.size || 'medium';
  const isSmall = size === 'small';

  const { accounts, boxProps } = props;
  const autoIndexed =
    props.autoIndexed !== undefined ? props.autoIndexed : false;

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

  const textStyle = isSmall
    ? {
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '16px',
        textDecoration: 'none',
      }
    : {
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '24px',
        textDecoration: 'none',
        letterSpacing: '-0.36px',
      };

  return (
    <Box direction="row" align="center" justify="between" {...boxProps}>
      <Box direction="row" align="center" gap="8px">
        <PlatformAvatar
          size={isSmall ? 24 : 44}
          imageUrl={avatar}></PlatformAvatar>

        <Box gap="4px">
          <Box style={{ flexShrink: 0 }}>
            <Text color={constants.colors.grayIcon} style={textStyle}>
              {displayName}
            </Text>
          </Box>

          {!isSmall && (
            <Box direction="row" align="center" gap="12px">
              <Box direction="row" align="center" gap="12px">
                {accounts.map((account, ix) => (
                  <AccountProfileAnchor
                    key={ix}
                    account={account}></AccountProfileAnchor>
                ))}
              </Box>

              {autoIndexed && <Autoindexed showInfo></Autoindexed>}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

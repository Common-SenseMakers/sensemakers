import { Box, BoxExtendedProps, Text } from 'grommet';
import { useMemo } from 'react';

import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { ALL_IDENTITY_PLATFORMS } from '../shared/types/types.platforms';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { AppUserPublicRead } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { AccountProfileAnchor } from './AccountProfileAnchor';

export const UserProfileHeader = (props: {
  user?: AppUserPublicRead;
  boxProps?: BoxExtendedProps;
}) => {
  const { constants } = useThemeContext();

  const { user, boxProps } = props;

  const profiles = useMemo(() => {
    if (!user) {
      return [];
    }

    let _profiles: AccountProfileRead[] = [];
    ALL_IDENTITY_PLATFORMS.map((platform) => {
      const accounts = user.profiles[platform];
      if (accounts) {
        _profiles = _profiles.concat(accounts);
      }
    });
    return _profiles;
  }, [user]);

  const { avatar, displayName } = useMemo(() => {
    if (profiles && profiles.length > 0) {
      const profile = profiles.find((p) => p.profile !== undefined);

      if (profile && profile.profile) {
        return {
          avatar: profile.profile.avatar,
          displayName: profile.profile.displayName,
        };
      }
    }

    return { avatar: '', displayName: '' };
  }, [profiles]);

  return (
    <Box direction="row" align="center" gap="8px" {...boxProps}>
      <PlatformAvatar size={48} imageUrl={avatar}></PlatformAvatar>
      <Box gap="4px">
        <Text
          color={constants.colors.primary}
          style={{
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '18px',
            textDecoration: 'none',
          }}>
          {displayName}
        </Text>
        <Box>
          {profiles.map((profile) => {
            return (
              <AccountProfileAnchor account={profile}></AccountProfileAnchor>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

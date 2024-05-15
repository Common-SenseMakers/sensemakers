import { Anchor, Box, DropButton, Text } from 'grommet';
import { UserExpert } from 'grommet-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { TwitterAvatar } from '../app/TwitterAvatar';
import { TwitterProfileAnchor } from '../app/anchors/TwitterAnchor';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM, UserDetailsBase } from '../shared/types/types';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { AppAddress } from '../ui-components/AppAddress';
import { useThemeContext } from '../ui-components/ThemedApp';
import { cap } from '../utils/general';
import { useAccountContext } from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/ConnectedUserContext';
import { getAccount } from './user.helper';

export const ConnectedUser = (props: {}) => {
  const { t } = useTranslation();
  const { isConnected, connectedUser } = useAccountContext();

  const navigate = useNavigate();

  const { disconnect } = useDisconnectContext();

  const [showDrop, setShowDrop] = useState<boolean>(false);
  const goToProfile = () => {
    const twitter = getAccount(
      connectedUser,
      PLATFORM.Twitter
    ) as UserDetailsBase<TwitterUserProfile>;
    if (twitter && twitter.profile) {
      navigate(AbsoluteRoutes.Profile(twitter.profile.username));
    }
  };

  const twitterDetails =
    connectedUser && connectedUser[PLATFORM.Twitter]?.length
      ? connectedUser[PLATFORM.Twitter][0].profile
      : undefined;

  const content = (() => {
    if (!isConnected) {
      return <></>;
    }

    return (
      <DropButton
        plain
        style={{ height: '70px', fontWeight: 'bold', padding: '0px 12px' }}
        pad="small"
        label={
          <Box direction="row" align="center">
            <TwitterAvatar size={40} profile={twitterDetails}></TwitterAvatar>
          </Box>
        }
        open={showDrop}
        onClose={() => setShowDrop(false)}
        onOpen={() => setShowDrop(true)}
        dropContent={
          <Box pad="20px" gap="small" style={{ width: '220px' }}>
            <AppButton
              plain
              onClick={() => goToProfile()}
              style={{ textTransform: 'none', paddingTop: '6px' }}>
              <Text>{cap(t('profile'))}</Text>
            </AppButton>

            <AppButton
              plain
              onClick={() => disconnect()}
              style={{ textTransform: 'none', paddingTop: '6px' }}>
              <Text style={{ fontWeight: 'bold' }}>{cap(t('logout'))}</Text>
            </AppButton>
          </Box>
        }
        dropProps={{
          style: { marginTop: '3px' },
          align: { top: 'bottom' },
        }}></DropButton>
    );
  })();

  return (
    <Box style={{ height: '60px' }} align="center" justify="center">
      {content}
    </Box>
  );
};

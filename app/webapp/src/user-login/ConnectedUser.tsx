import { Anchor, Box, DropButton, Text } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { RouteNames } from '../route.names';
import { PLATFORM } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { cap } from '../utils/general';
import { useAccountContext } from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/ConnectedUserContext';

export const ConnectedUser = (props: {}) => {
  const { t } = useTranslation();
  const { isConnected, connectedUser } = useAccountContext();

  const navigate = useNavigate();

  const { disconnect } = useDisconnectContext();

  const [showDrop, setShowDrop] = useState<boolean>(false);

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
            <Anchor
              target="_blank"
              href={`${RouteNames.Profile}/${PLATFORM.Twitter}/${twitterDetails?.username}`}
              style={{
                textDecoration: 'none',
                textTransform: 'none',
                paddingTop: '6px',
              }}>
              <Text>{cap(t('profile'))}</Text>
            </Anchor>

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

import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IntroKeys } from '../i18n/i18n.intro';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import {
  PlatformConnectedStatus,
  useAccountContext,
} from './contexts/AccountContext';
import { useBlueskyContext } from './contexts/platforms/BlueskyContext';

export const ConnectBlueskyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connect, error } = useBlueskyContext();
  const { connectedUser, getPlatformConnectedStatus } = useAccountContext();
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');

  const blueskyProfile = connectedUser?.profiles?.bluesky;

  useEffect(() => {
    if (blueskyProfile && !blueskyProfile.isDisconnected) {
      navigate(-1);
    }
  }, [blueskyProfile, navigate]);

  const handleConnect = () => {
    if (connect) {
      let cleanUsername = username.trim();

      if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.slice(1);
      }
      connect(cleanUsername, appPassword, 'read').catch(console.error);
    }
  };
  const connectionStatus = getPlatformConnectedStatus(PLATFORM.Bluesky);

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <Box style={{ flexGrow: 1 }}>
        {(connectionStatus === PlatformConnectedStatus.Disconnected ||
          connectionStatus === PlatformConnectedStatus.ReconnectRequired) && (
          <>
            <AppHeading level="1">{'Connect to Bluesky'}</AppHeading>
            <Box width="100%" height="16px" />
            <AppParagraph margin={{ bottom: 'medium' }}>
              To connect your Bluesky account, you need to{' '}
              <a
                target="_blank"
                href="https://bsky.app/settings/app-passwords"
                rel="noreferrer">
                generate an app password
              </a>
              .
            </AppParagraph>
            <AppParagraph
              margin={{ bottom: 'small' }}
              size="small"
              style={{ fontWeight: 'bold' }}>
              {'bluesky username'}
            </AppParagraph>
            <Box margin={{ bottom: 'medium' }}>
              <AppInput
                placeholder={'username.bsky.social'}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                style={{ width: '100%' }}
              />
            </Box>
            <AppParagraph
              margin={{ bottom: 'small' }}
              size="small"
              style={{ fontWeight: 'bold' }}>
              {'app password'}
            </AppParagraph>
            <Box margin={{ bottom: 'medium' }}>
              <AppInput
                type="password"
                placeholder={''}
                value={appPassword}
                onChange={(event) => setAppPassword(event.target.value)}
                style={{ width: '100%' }}
              />
            </Box>
            <Box align="center" margin={{ top: 'medium' }}>
              <AppButton
                primary
                label={t(IntroKeys.continue)}
                onClick={handleConnect}
                disabled={!username || !appPassword}
                style={{ width: '100%' }}
              />
            </Box>
          </>
        )}
        {getPlatformConnectedStatus(PLATFORM.Bluesky) ===
          PlatformConnectedStatus.Connecting && (
          <>
            <AppHeading level="1">{'Connecting to Bluesky'}</AppHeading>
            <Loading />
          </>
        )}
        {getPlatformConnectedStatus(PLATFORM.Bluesky) ===
          PlatformConnectedStatus.Connected && (
          <>
            <AppHeading level="1">{'Connected to Bluesky'}</AppHeading>
          </>
        )}
        {error && (
          <Box margin={{ top: 'small' }}>
            <AppParagraph color="status-error">{error}</AppParagraph>
          </Box>
        )}
      </Box>
    </Box>
  );
};

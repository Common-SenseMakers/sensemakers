import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { useAccountContext } from './contexts/AccountContext';
import { useBlueskyContext } from './contexts/platforms/BlueskyContext';

export const ConnectBlueskyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connect, error } = useBlueskyContext();
  const { blueskyProfile } = useAccountContext();
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');

  useEffect(() => {
    if (blueskyProfile) {
      navigate(-1);
    }
  }, [blueskyProfile, navigate]);

  const handleConnect = () => {
    if (connect) {
      connect(username, appPassword);
    }
  };

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }} />
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{'Connect to Bluesky'}</AppHeading>
        <Box width="100%" height="16px" />
        <AppParagraph margin={{ bottom: 'medium' }}>
          To connect your Bluesky account, you need to{' '}
          <a href="https://bsky.app/settings/app-passwords">
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
            label={t(I18Keys.continue)}
            onClick={handleConnect}
            disabled={!username || !appPassword}
            style={{ width: '100%' }}
          />
        </Box>
        {error && (
          <Box margin={{ top: 'small' }}>
            <AppParagraph color="status-error">{error}</AppParagraph>
          </Box>
        )}
      </Box>
    </Box>
  );
};

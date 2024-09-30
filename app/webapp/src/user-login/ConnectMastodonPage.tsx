import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { AbsoluteRoutes } from '../route.names';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { useAccountContext } from './contexts/AccountContext';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { isValidMastodonDomain } from './user.helper';

export const ConnectMastodonPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { connect, error } = useMastodonContext();
  const { connectedUser } = useAccountContext();
  const [mastodonServer, setMastodonServer] = useState('');

  const mastodonProfile = connectedUser?.profiles?.mastodon;

  useEffect(() => {
    if (mastodonProfile) {
      navigate(AbsoluteRoutes.App);
    }
  }, [mastodonProfile, navigate]);

  const handleConnect = () => {
    if (connect) {
      connect(mastodonServer, 'read', location.state?.callbackUrl);
    }
  };

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }} />
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{t(I18Keys.connectMastodonTitle)}</AppHeading>
        <Box width="100%" height="16px" />
        <AppParagraph margin={{ bottom: 'medium' }}>
          {t(I18Keys.connectMastodonParagraph)}
        </AppParagraph>
        <AppParagraph
          margin={{ bottom: 'small' }}
          size="small"
          style={{ fontWeight: 'bold' }}>
          {t(I18Keys.mastodonServer)}
        </AppParagraph>
        <Box margin={{ bottom: 'medium' }}>
          <AppInput
            placeholder={t(I18Keys.mastodonServerPlaceholder)}
            value={mastodonServer}
            onChange={(event) => setMastodonServer(event.target.value)}
            style={{ width: '100%' }}
          />
        </Box>
        <Box align="center" margin={{ top: 'medium' }}>
          <AppButton
            primary
            label={t(I18Keys.continue)}
            onClick={handleConnect}
            disabled={!isValidMastodonDomain(mastodonServer)}
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

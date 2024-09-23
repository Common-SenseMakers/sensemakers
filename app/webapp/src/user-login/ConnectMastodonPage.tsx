import { Box } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { isValidMastodonDomain } from './user.helper';

export const ConnectMastodonPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { connect, error } = useMastodonContext();
  const [mastodonServer, setMastodonServer] = useState('');

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
        <AppHeading level="1">{'connect to mastodon'}</AppHeading>
        <Box width="100%" height="16px" />
        <AppParagraph margin={{ bottom: 'medium' }}>
          {'enter your mastodon server below'}
        </AppParagraph>
        <Box margin={{ bottom: 'medium' }}>
          <AppInput
            placeholder={t(I18Keys.mastodonServerPlaceholder)}
            value={mastodonServer}
            onChange={(event) => setMastodonServer(event.target.value)}
            style={{ width: '100%' }}
          />
        </Box>
        <Box direction="row" justify="between">
          <AppButton
            primary
            label={'connect'}
            onClick={handleConnect}
            disabled={!isValidMastodonDomain(mastodonServer)}
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

import { Box } from 'grommet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { IntroKeys } from '../i18n/i18n.intro';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppHeading } from '../ui-components';
import { useAccountContext } from './contexts/AccountContext';

export const ConnectTwitterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connectedPlatforms } = useAccountContext();

  useEffect(() => {
    if (connectedPlatforms.includes(PLATFORM.Twitter)) {
      navigate(AbsoluteRoutes.App);
    }
  }, [connectedPlatforms, navigate]);

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }} />
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{t(IntroKeys.connnectingTwitter)}</AppHeading>
        <Box width="100%" height="16px" />
      </Box>
    </Box>
  );
};

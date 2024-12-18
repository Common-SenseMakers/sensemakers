import { Box } from 'grommet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IntroKeys } from '../i18n/i18n.intro';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
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
      <Box style={{ flexGrow: 1 }} align="center">
        <AppHeading level="2">{t(IntroKeys.connnectingTwitter)}</AppHeading>
        <BoxCentered width="100%" height="160px">
          <Loading></Loading>
        </BoxCentered>
      </Box>
    </Box>
  );
};

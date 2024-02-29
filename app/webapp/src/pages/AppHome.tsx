import { Box } from 'grommet';
import { Edit, Network } from 'grommet-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAccountContext } from '../app/AccountContext';
import { AppConnectWidget } from '../app/AppConnectButton';
import { AppPlatformManager } from '../app/AppPlaformManager';
import { AppBottomNav } from '../common/AppBottomNav';
import { ViewportPage } from '../common/Viewport';
import { AbsoluteRoutes, RouteNames } from '../route.names';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';

export const AppHome = (props: {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isConnected, isConnecting } = useAccountContext();

  const content = (() => {
    if (isConnecting) {
      return <Loading></Loading>;
    }

    return (
      <>
        {!isConnected ? (
          <AppConnectWidget></AppConnectWidget>
        ) : (
          <AppPlatformManager></AppPlatformManager>
        )}
        <Box margin={{ vertical: 'xlarge' }}>
          <AppButton
            primary
            onClick={() => navigate(RouteNames.SciOS)}
            label={'SciOS 2024 - Top Links'}></AppButton>
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={<BoxCentered>{content}</BoxCentered>}
      nav={
        <AppBottomNav
          paths={{
            [AbsoluteRoutes.App]: {
              icon: <Network></Network>,
              label: t('socials'),
            },
            [AbsoluteRoutes.Post]: {
              disabled: !isConnected,
              icon: <Edit></Edit>,
              label: t('editor'),
            },
          }}></AppBottomNav>
      }></ViewportPage>
  );
};

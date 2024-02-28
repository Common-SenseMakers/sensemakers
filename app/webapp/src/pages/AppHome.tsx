import { Edit, Network } from 'grommet-icons';
import { useTranslation } from 'react-i18next';

import { useAccountContext } from '../app/AccountContext';
import { AppConnectWidget } from '../app/AppConnectButton';
import { AppPlatformManager } from '../app/AppPlaformManager';
import { AppBottomNav } from '../common/AppBottomNav';
import { ViewportPage } from '../common/Viewport';
import { AbsoluteRoutes } from '../route.names';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';

export const AppHome = (props: {}) => {
  const { t } = useTranslation();

  const { isConnected, isConnecting } = useAccountContext();

  const content = (() => {
    if (isConnecting) {
      return <Loading></Loading>;
    }

    if (!isConnected) return <AppConnectWidget></AppConnectWidget>;

    return (
      <>
        <AppPlatformManager></AppPlatformManager>
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

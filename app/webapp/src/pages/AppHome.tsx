import { Edit, Network } from 'grommet-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppBottomNav } from '../app/layout/AppBottomNav';
import { ViewportPage } from '../app/layout/Viewport';
import { AbsoluteRoutes } from '../route.names';
import { BoxCentered } from '../ui-components/BoxCentered';
import { AppPlatformManager } from '../user/AppPlaformManager';
import { useAccountContext } from '../user/contexts/AccountContext';

export const AppHome = (props: {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isConnected } = useAccountContext();

  const content = (() => {
    return <AppPlatformManager></AppPlatformManager>;
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

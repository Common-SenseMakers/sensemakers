import { Edit, Network } from 'grommet-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAccountContext } from '../app/AccountContext';
import { AppPlatformManager } from '../app/AppPlaformManager';
import { AppBottomNav } from '../common/AppBottomNav';
import { ViewportPage } from '../common/Viewport';
import { AbsoluteRoutes } from '../route.names';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';

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
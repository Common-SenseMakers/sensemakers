import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { BoxCentered } from '../ui-components/BoxCentered';
import { UserHome } from '../user-home/UserHome';
import { PlatformManager } from '../user-login/PlaformManager';
import { useAccountContext } from '../user-login/contexts/AccountContext';

export const AppHome = (props: {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isConnected } = useAccountContext();

  const content = (() => {
    if (!isConnected) {
      return <PlatformManager></PlatformManager>;
    } else {
      return <UserHome></UserHome>;
    }
  })();

  return (
    <ViewportPage
      content={<BoxCentered>{content}</BoxCentered>}
      nav={<></>}></ViewportPage>
  );
};

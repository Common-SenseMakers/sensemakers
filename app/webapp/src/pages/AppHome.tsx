import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAccountContext } from '../app/AccountContext';
import { AppConnectWidget } from '../app/AppConnectButton';
import { AppPlatformManager } from '../app/AppPlaformManager';
import { useTwitterContext } from '../app/TwitterContext';
import { ViewportPage } from '../app/Viewport';
import { AbsoluteRoutes } from '../route.names';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';

export const AppHome = (props: {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isConnected, isConnecting } = useAccountContext();
  const { needAuthorize: needAuthorizeTwitter } = useTwitterContext();

  const content = (() => {
    if (isConnecting) {
      return <Loading></Loading>;
    }

    if (!isConnected) return <AppConnectWidget></AppConnectWidget>;

    const canPost = !needAuthorizeTwitter;

    return (
      <>
        <AppPlatformManager></AppPlatformManager>
        <AppButton
          primary
          disabled={!canPost}
          label={t('post')}
          onClick={() => navigate(AbsoluteRoutes.Post)}
          style={{ minWidth: '180px' }}></AppButton>
      </>
    );
  })();

  return (
    <ViewportPage
      content={<BoxCentered>{content}</BoxCentered>}
      nav={<></>}></ViewportPage>
  );
};

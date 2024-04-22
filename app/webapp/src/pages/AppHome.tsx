import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { BoxCentered } from '../ui-components/BoxCentered';
import { UserHome } from '../user-home/UserHome';
import { UserPostsContext } from '../user-home/UserPostsContext';
import { PlatformManager } from '../user-login/PlaformManager';
import { useAccountContext } from '../user-login/contexts/AccountContext';

export const AppHome = (props: {}) => {
  const { isConnected } = useAccountContext();

  const content = (() => {
    if (!isConnected) {
      return <PlatformManager></PlatformManager>;
    } else {
      return (
        <UserPostsContext>
          <UserHome></UserHome>
        </UserPostsContext>
      );
    }
  })();

  return (
    <ViewportPage
      content={<BoxCentered>{content}</BoxCentered>}
      nav={<></>}></ViewportPage>
  );
};

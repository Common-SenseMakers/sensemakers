import { Outlet } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { UserHome } from '../user-home/UserHome';
import { PlatformManager } from '../user-login/PlaformManager';
import { useAccountContext } from '../user-login/contexts/AccountContext';

export const AppHome = (props: {}) => {
  const { isConnected } = useAccountContext();

  const content = (() => {
    if (!isConnected) {
      return <PlatformManager></PlatformManager>;
    } else {
      return <UserHome></UserHome>;
    }
  })();

  return <ViewportPage content={content}></ViewportPage>;
};

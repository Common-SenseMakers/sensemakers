import { Outlet } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { UserHome } from '../user-home/UserHome';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

export const AppHome = (props: {}) => {
  const { isConnected } = useAccountContext();

  const content = (() => {
    if (!isConnected) {
      return <AppWelcome></AppWelcome>;
    } else {
      return <UserHome></UserHome>;
    }
  })();

  return <ViewportPage content={content} justify="start"></ViewportPage>;
};

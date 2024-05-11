import { Box } from 'grommet';
import { createContext, useContext, useMemo, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { PostPage } from '../post/PostPage';
import { RouteNames } from '../route.names';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { ConnectedUserWrapper } from '../user-login/contexts/ConnectedUserWrapper';
import { GlobalNav } from './layout/GlobalNav';
import { GlobalStyles } from './layout/GlobalStyles';
import { MAX_WIDTH_APP, ViewportContainer } from './layout/Viewport';

export interface SetPageTitleType {
  prefix: string;
  main: string;
}

export type AppContainerContextType = {
  setTitle: (title: SetPageTitleType) => void;
};

const AppContainerContextValue = createContext<
  AppContainerContextType | undefined
>(undefined);

export const AppContainer0 = (props: React.PropsWithChildren) => {
  return (
    <ConnectedUserWrapper>
      <AppContainer></AppContainer>
    </ConnectedUserWrapper>
  );
};

export const AppContainer = (props: React.PropsWithChildren) => {
  const { connectedUser } = useAccountContext();
  const [title, setTitle] = useState<SetPageTitleType>();

  const location = useLocation();

  const { topHeight } = useMemo(() => {
    if (location.pathname === '/' && !connectedUser) {
      return { topHeight: '0px' };
    }
    return { topHeight: '70px' };
  }, [location]);

  return (
    <>
      <GlobalStyles />
      <ThemedApp>
        <ResponsiveApp>
          <AppContainerContextValue.Provider value={{ setTitle }}>
            <ViewportContainer style={{ maxWidth: MAX_WIDTH_APP }}>
              <Box
                pad={{ horizontal: 'medium' }}
                style={{ height: topHeight, flexShrink: 0 }}
                justify="center">
                <GlobalNav title={title} />
              </Box>
              <Box style={{ height: `calc(100% - ${topHeight})` }}>
                <Routes>
                  <Route path={RouteNames.AppHome} element={<Outlet />}>
                    <Route
                      path={RouteNames.PostView}
                      element={<PostPage></PostPage>}></Route>
                    <Route path={''} element={<AppHome></AppHome>}></Route>
                    <Route path={'/*'} element={<AppHome></AppHome>}></Route>
                  </Route>
                </Routes>
              </Box>
            </ViewportContainer>
          </AppContainerContextValue.Provider>
        </ResponsiveApp>
      </ThemedApp>
    </>
  );
};

export const useAppContainer = (): AppContainerContextType => {
  const context = useContext(AppContainerContextValue);
  if (!context) throw Error('context not found');
  return context;
};

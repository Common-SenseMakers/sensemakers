import { Box } from 'grommet';
import { createContext, useContext, useState } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { PostPage } from '../post/PostPage';
import { RouteNames } from '../route.names';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp } from '../ui-components/ThemedApp';
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

export const AppContainer = (props: React.PropsWithChildren) => {
  const [title, setTitle] = useState<SetPageTitleType>();
  const topHeight = '70px';

  return (
    <ConnectedUserWrapper>
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
    </ConnectedUserWrapper>
  );
};

export const useAppContainer = (): AppContainerContextType => {
  const context = useContext(AppContainerContextValue);
  if (!context) throw Error('context not found');
  return context;
};

import { Box } from 'grommet';
import { createContext, useContext, useMemo, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { PostPage } from '../post/PostPage';
import { ProfilePage } from '../profile/ProfilePage';
import { ProfilePostPage } from '../profile/ProfilePostPage';
import { ProfileRoot } from '../profile/ProfileRoot';
import { RouteNames } from '../route.names';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { ConnectedUserWrapper } from '../user-login/contexts/ConnectedUserWrapper';
import { UserSettingsPage } from '../user-settings/UserSettingsPage';
import { LoadingContext } from './LoadingContext';
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
    <>
      <GlobalStyles />
      <ThemedApp>
        <ResponsiveApp>
          <LoadingContext>
            <ConnectedUserWrapper>
              <AppContainer></AppContainer>
            </ConnectedUserWrapper>
          </LoadingContext>
        </ResponsiveApp>
      </ThemedApp>
    </>
  );
};

export const AppContainer = (props: React.PropsWithChildren) => {
  const { connectedUser } = useAccountContext();
  const [title, setTitle] = useState<SetPageTitleType>();

  const topHeight = '0px';

  return (
    <>
      <AppContainerContextValue.Provider value={{ setTitle }}>
        <ViewportContainer style={{ maxWidth: MAX_WIDTH_APP }}>
          <Box style={{ height: `calc(100% - ${topHeight})` }}>
            <Routes>
              <Route path={RouteNames.AppHome} element={<Outlet />}>
                <Route
                  path={`${RouteNames.Profile}/:platform/:username`}
                  element={<ProfileRoot></ProfileRoot>}>
                  <Route
                    path={`:postId`}
                    element={<ProfilePostPage></ProfilePostPage>}></Route>

                  <Route
                    path={``}
                    element={<ProfilePage></ProfilePage>}></Route>
                </Route>

                <Route
                  path={`${RouteNames.Post}/:postId`}
                  element={<PostPage></PostPage>}></Route>

                <Route
                  path={`${RouteNames.Settings}`}
                  element={<UserSettingsPage></UserSettingsPage>}></Route>
                <Route path={''} element={<AppHome></AppHome>}></Route>
                <Route path={'/*'} element={<AppHome></AppHome>}></Route>
              </Route>
            </Routes>
          </Box>
        </ViewportContainer>
      </AppContainerContextValue.Provider>
    </>
  );
};

export const useAppContainer = (): AppContainerContextType => {
  const context = useContext(AppContainerContextValue);
  if (!context) throw Error('context not found');
  return context;
};

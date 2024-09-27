import { constants } from 'buffer';
import { Box } from 'grommet';
import { createContext, useContext, useMemo, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { PostPage } from '../post/PostPage';
import { PostingPage } from '../post/PostingPage';
import { RouteNames } from '../route.names';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp, useThemeContext } from '../ui-components/ThemedApp';
import { ConnectBlueskyPage } from '../user-login/ConnectBlueskyPage';
import { ConnectMastodonPage } from '../user-login/ConnectMastodonPage';
import { ConnectedUserWrapper } from '../user-login/contexts/ConnectedUserWrapper';
import { UserSettingsPage } from '../user-settings/UserSettingsPage';
import { LoadingContext } from './LoadingContext';
import { GlobalStyles } from './layout/GlobalStyles';
import { MAX_WIDTH_APP, ViewportContainer } from './layout/Viewport';

export interface SetPageTitleType {
  prefix: string;
  main: string;
}

export type AppContainerContextType = {};

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
  const { constants } = useThemeContext();

  const topHeight = '0px';

  return (
    <>
      <AppContainerContextValue.Provider value={{}}>
        <ViewportContainer
          style={{
            maxWidth: MAX_WIDTH_APP,
            backgroundColor: constants.colors.shade,
          }}>
          <Box style={{ height: `calc(100% - ${topHeight})` }}>
            <Routes>
              <Route path={RouteNames.AppHome} element={<Outlet />}>
                <Route
                  path={`${RouteNames.Posting}`}
                  element={<PostingPage></PostingPage>}></Route>

                <Route
                  path={`${RouteNames.Post}/:postId`}
                  element={<PostPage></PostPage>}></Route>

                <Route
                  path={`${RouteNames.Settings}`}
                  element={<UserSettingsPage></UserSettingsPage>}></Route>
                <Route
                  path={`${RouteNames.ConnectMastodon}`}
                  element={<ConnectMastodonPage />}
                />
                <Route
                  path={`${RouteNames.ConnectBluesky}`}
                  element={<ConnectBlueskyPage />}
                />
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

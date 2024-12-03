import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box } from 'grommet';
import { createContext, useContext, useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import { AppHomePage } from '../pages/AppHomePage';
import { PublicFeedPage } from '../pages/PublicFeedPage';
import { UserPostsPage } from '../pages/UserPostsPage';
import { UserSettingsPage } from '../pages/UserSettingsPage';
import { RouteNames } from '../route.names';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp, useThemeContext } from '../ui-components/ThemedApp';
import { ConnectBlueskyPage } from '../user-login/ConnectBlueskyPage';
import { ConnectMastodonPage } from '../user-login/ConnectMastodonPage';
import { ConnectTwitterPage } from '../user-login/ConnectTwitterPage';
import { ConnectedUserWrapper } from '../user-login/contexts/ConnectedUserWrapper';
import { LoadingContext } from './LoadingContext';
import { GlobalStyles } from './layout/GlobalStyles';
import { MAX_WIDTH_APP, ViewportContainer } from './layout/Viewport';

export interface SetPageTitleType {
  prefix: string;
  main: string;
}

const DEBUG = false;
const DEBUG_PREFIX = ``;

export type AppContainerContextType = object;

const AppContainerContextValue = createContext<
  AppContainerContextType | undefined
>(undefined);

const queryClient = new QueryClient();

export const AppContainer0 = (props: React.PropsWithChildren) => {
  // for debug
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (DEBUG) console.log(`${DEBUG_PREFIX}AppContainer0 mounted`);
    }
    return () => {
      mounted = false;
      if (DEBUG) console.log(`${DEBUG_PREFIX}AppContainer0 unmounted`);
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <ThemedApp>
        <ResponsiveApp>
          <QueryClientProvider client={queryClient}>
            <LoadingContext>
              <ConnectedUserWrapper>
                <AppContainer></AppContainer>
              </ConnectedUserWrapper>
            </LoadingContext>
          </QueryClientProvider>
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
                  path={`${RouteNames.Settings}/*`}
                  element={<UserSettingsPage></UserSettingsPage>}></Route>

                <Route
                  path={`${RouteNames.Feed}/*`}
                  element={<PublicFeedPage></PublicFeedPage>}></Route>

                <Route path={''} element={<AppHomePage></AppHomePage>}></Route>

                <Route
                  path={`/${RouteNames.MyPosts}`}
                  element={<UserPostsPage></UserPostsPage>}></Route>

                <Route
                  path={`${RouteNames.ConnectTwitter}`}
                  element={<ConnectTwitterPage />}
                />

                <Route
                  path={`${RouteNames.ConnectMastodon}`}
                  element={<ConnectMastodonPage />}
                />

                <Route
                  path={`${RouteNames.ConnectBluesky}`}
                  element={<ConnectBlueskyPage />}></Route>
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

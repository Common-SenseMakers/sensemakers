import { Box } from 'grommet';
import { createContext, useContext, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { PostPage } from '../post/PostPage';
import { RouteNames } from '../route.names';
import { GlobalNav } from './layout/GlobalNav';
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
            <Route
              path={RouteNames.AppHome}
              element={<Navigate to={RouteNames.PostsView} />}></Route>
            <Route
              path={RouteNames.PostView}
              element={<PostPage></PostPage>}></Route>
            <Route
              path={RouteNames.PostsView}
              element={<AppHome></AppHome>}></Route>
          </Routes>
        </Box>
      </ViewportContainer>
    </AppContainerContextValue.Provider>
  );
};

export const useAppContainer = (): AppContainerContextType => {
  const context = useContext(AppContainerContextValue);
  if (!context) throw Error('context not found');
  return context;
};

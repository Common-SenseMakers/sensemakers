import { Box } from 'grommet';
import { createContext, useContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppHome } from '../pages/AppHome';
import { AppPostPage } from '../pages/AppPostPage';
import { RouteNames } from '../route.names';
import { AppTest } from './AppTest';
import { GlobalNav } from './GlobalNav';
import { MAX_WIDTH_APP, ViewportContainer } from './Viewport';

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

  return (
    <AppContainerContextValue.Provider value={{ setTitle }}>
      <ViewportContainer style={{ maxWidth: MAX_WIDTH_APP }}>
        <Box
          pad={{ horizontal: 'medium' }}
          style={{ height: '80px', flexShrink: 0 }}
          justify="center">
          <GlobalNav title={title} />
        </Box>
        <Box style={{ height: 'calc(100% - 80px)' }}>
          <Routes>
            <Route
              path={RouteNames.AppHome}
              element={<AppHome></AppHome>}></Route>
            <Route
              path={RouteNames.Post}
              element={<AppPostPage></AppPostPage>}></Route>
            <Route path={RouteNames.Test} element={<AppTest></AppTest>}></Route>
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

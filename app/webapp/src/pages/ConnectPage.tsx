import { Box } from 'grommet';
import { Outlet } from 'react-router-dom';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';

export const ConnectPage = () => {
  return (
    <ViewportPage
      addLogo
      content={
        <Box
          pad={{ horizontal: 'medium', vertical: 'large' }}
          style={{ flexGrow: 1 }}>
          <Box style={{ flexGrow: 1 }}>
            <Box width="100%" height="16px" />
            <Outlet></Outlet>
          </Box>
        </Box>
      }
      nav={<GlobalNav></GlobalNav>}
      justify="start"
    />
  );
};

import { Box } from 'grommet';
import { title } from 'process';
import { Outlet } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { AppHeading } from '../ui-components';

export const ConnectPage = () => {
  return (
    <ViewportPage
      fixed
      content={
        <Box
          pad={{ horizontal: 'medium', vertical: 'large' }}
          style={{ flexGrow: 1 }}>
          <AppLogo margin={{ bottom: 'xlarge' }} />
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{title}</AppHeading>
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

import { Box } from 'grommet';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { OverlayContext } from '../overlays/OverlayContext';
import { UserPostsFeed } from '../user-home/UserPostsFeed';

export const UserPostsPage = () => {
  return (
    <ViewportPage
      fixed
      content={
        <Box style={{ position: 'relative', paddingTop: '16px' }}>
          <OverlayContext>
            <UserPostsFeed></UserPostsFeed>
          </OverlayContext>
        </Box>
      }
      nav={<GlobalNav></GlobalNav>}
      justify="start"
    />
  );
};

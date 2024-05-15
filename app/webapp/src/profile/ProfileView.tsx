import { Box } from 'grommet';

import { useAppFetch } from '../api/app.fetch';
import { ViewportPage } from '../app/layout/Viewport';
import { AppPostFull } from '../shared/types/types.posts';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ProfileHeader } from './ProfileHeader';

/** extract the postId from the route and pass it to a PostContext */
export const ProfileView = (props: { username?: string }) => {
  const { constants } = useThemeContext();
  const username = props.username;

  const appFetch = useAppFetch();

  const content = (() => {
    if (!username) {
      return (
        <Box gap="12px">
          <LoadingDiv height="60px" width="100%"></LoadingDiv>
          <Box>
            {[1, 2, 4, 5, 6].map((ix) => (
              <LoadingDiv
                key={ix}
                height="108px"
                width="100%"
                margin={{ bottom: '2px' }}></LoadingDiv>
            ))}
          </Box>
        </Box>
      );
    }

    const tabs = [
      {
        label: 'All',
        getPosts: () => {
          appFetch<AppPostFull[]>('/api/');
        },
      },
    ];

    return (
      <Box
        pad={{ top: 'medium' }}
        style={{ backgroundColor: constants.colors.shade }}>
        <ProfileHeader
          pad={{
            top: '12px',
            horizontal: '12px',
            bottom: '16px',
          }}></ProfileHeader>
        <Box>{}</Box>
      </Box>
    );
  })();

  return <ViewportPage content={<Box fill>{content}</Box>}></ViewportPage>;
};

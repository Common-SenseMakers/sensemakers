import { Box, BoxExtendedProps, Text } from 'grommet';
import React from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { AbsoluteRoutes, RouteNames } from '../../route.names';
import { PostsQueryStatus } from '../../shared/types/types.posts';
import { AppButton } from '../../ui-components';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { DraftsIcon } from '../icons/DraftsIcon';
import { PublishedIcon } from '../icons/PublishedIcon';
import { SettignsIcon } from '../icons/SettingsIcon';

const DEBUG = false;

export const locationToPageIx = (location: Location) => {
  if (DEBUG) console.log(location);

  if (
    location.pathname === '/' ||
    location.pathname.startsWith(`/${PostsQueryStatus.DRAFTS}`) ||
    location.pathname.startsWith(`/${PostsQueryStatus.IGNORED}`) ||
    location.pathname.startsWith(`/${PostsQueryStatus.PENDING}`)
  ) {
    return 0;
  }

  if (location.pathname.startsWith(`/${PostsQueryStatus.PUBLISHED}`)) {
    return 1;
  }

  if (location.pathname.startsWith(`/${RouteNames.Settings}`)) {
    return 3;
  }
};

export const GlobalNav = (props: {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const pageIx = locationToPageIx(location);

  const button = (
    text: string,
    icon: JSX.Element,
    route: string,
    isSelected: boolean
  ) => {
    const internalBoxProps: BoxExtendedProps = {
      direction: 'row',
      gap: '4px',
      align: 'center',
      justify: 'center',
    };
    const externalBoxProps: BoxExtendedProps = {
      style: {
        flexGrow: 1,
        height: '100%',
        justifyContent: 'center',
      },
      border: {
        color: isSelected ? constants.colors.primary : 'transparent',
        side: 'top',
        size: '2px',
      },
    };

    return (
      <Box {...externalBoxProps}>
        <AppButton
          plain
          style={{ height: '100%' }}
          onClick={() => {
            navigate(route);
          }}>
          <Box {...internalBoxProps}>
            {React.cloneElement(icon, { size: 24 })}
            <Box justify="center">
              <Text size="small">{text}</Text>
            </Box>
          </Box>
        </AppButton>
      </Box>
    );
  };

  return (
    <Box direction="row" align="center" style={{ height: '48px' }}>
      {button(
        'Drafts',
        <DraftsIcon></DraftsIcon>,
        `/${PostsQueryStatus.DRAFTS}`,
        pageIx === 0
      )}
      {button(
        'Nanopubs',
        <PublishedIcon></PublishedIcon>,
        `/${PostsQueryStatus.PUBLISHED}`,
        pageIx === 1
      )}
      {button(
        'Settings',
        <SettignsIcon></SettignsIcon>,
        AbsoluteRoutes.Settings,
        pageIx === 3
      )}
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AbsoluteRoutes, RouteNames } from '../../route.names';
import { PostsQueryStatus } from '../../shared/types/types.posts';
import { PLATFORM } from '../../shared/types/types.user';
import { AppButton } from '../../ui-components';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { useAccountContext } from '../../user-login/contexts/AccountContext';
import { APP_URL } from '../config';
import { AvatarIcon } from '../icons/AvatarIcon';
import { DraftsIcon } from '../icons/DraftsIcon';
import { PublishedIcon } from '../icons/PublishedIcon';
import { SettignsIcon } from '../icons/SettingsIcon';

export const GlobalNav = (props: {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { connectedUser } = useAccountContext();
  const { constants } = useThemeContext();

  const twitterDetails =
    connectedUser && connectedUser[PLATFORM.Twitter]?.length
      ? connectedUser[PLATFORM.Twitter][0].profile
      : undefined;

  const pageIx = (() => {
    console.log(location);
    if (
      location.pathname.startsWith(`/${PostsQueryStatus.ALL}`) ||
      location.pathname.startsWith(`/${PostsQueryStatus.IGNORED}`) ||
      location.pathname.startsWith(`/${PostsQueryStatus.PENDING}`)
    ) {
      return 0;
    }

    if (location.pathname.startsWith(`/${PostsQueryStatus.PUBLISHED}`)) {
      return 1;
    }

    if (location.pathname.startsWith(`/${RouteNames.Profile}`)) {
      return 2;
    }

    if (location.pathname.startsWith(`/${RouteNames.Settings}`)) {
      return 3;
    }
  })();

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
          onClick={() => {
            console.log(route);
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
        `/${PostsQueryStatus.ALL}`,
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

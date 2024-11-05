import { Box, BoxExtendedProps, Text } from 'grommet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { AppGeneralKeys } from '../../i18n/i18n.app.general';
import { AbsoluteRoutes, RouteNames } from '../../route.names';
import { AppButton } from '../../ui-components';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { DraftsIcon } from '../icons/DraftsIcon';
import { FeedIcon } from '../icons/FeedIcon';
import { SettignsIcon } from '../icons/SettingsIcon';

const DEBUG = false;

export const locationToPageIx = (location: Location) => {
  if (DEBUG) console.log(location);

  if (
    location.pathname === '/' ||
    location.pathname.startsWith(`/${RouteNames.MyPosts}`)
  ) {
    return 0;
  }

  if (location.pathname.startsWith(`/${RouteNames.Feed}`)) {
    return 1;
  }

  if (location.pathname.startsWith(`/${RouteNames.Settings}`)) {
    return 2;
  }
};

export const GlobalNav = () => {
  const { t } = useTranslation();
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
        t(AppGeneralKeys.myPosts),
        <DraftsIcon></DraftsIcon>,
        AbsoluteRoutes.MyPosts,
        pageIx === 0
      )}
      {button(
        t(AppGeneralKeys.feedTitle),
        <FeedIcon></FeedIcon>,
        AbsoluteRoutes.Feed,
        pageIx === 1
      )}
      {button(
        t(AppGeneralKeys.settings),
        <SettignsIcon></SettignsIcon>,
        AbsoluteRoutes.Settings,
        pageIx === 2
      )}
    </Box>
  );
};

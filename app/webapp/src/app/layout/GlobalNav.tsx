import { Box, BoxExtendedProps, Text } from 'grommet';
import { usePostHog } from 'posthog-js/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { POSTHOG_EVENTS } from '../../analytics/posthog.events';
import { AppGeneralKeys } from '../../i18n/i18n.app.general';
import { ClustersMenu } from '../../posts.fetcher/ClustersMenu';
import { AbsoluteRoutes, RouteNames } from '../../route.names';
import { AppButton, AppHeading } from '../../ui-components';
import { useResponsive } from '../../ui-components/ResponsiveApp';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { DraftsIcon } from '../icons/DraftsIcon';
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

const NavButton = (props: {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const { label, icon, isSelected } = props;
  const { constants } = useThemeContext();
  const { mobile } = useResponsive();

  const internalBoxProps: BoxExtendedProps = {
    direction: 'row',
    gap: '4px',
    align: 'center',
    justify: 'center',
    pad: mobile ? 'none' : { vertical: '12px', horizontal: '16px' },
  };

  const externalBoxProps: BoxExtendedProps = {
    style: {
      flexGrow: 1,
      height: '100%',
      justifyContent: 'center',
    },
    border: {
      color: isSelected ? constants.colors.primary : 'transparent',
      side: mobile ? 'top' : 'left',
      size: mobile ? '2px' : '4px',
    },
  };

  return (
    <Box {...externalBoxProps}>
      <AppButton
        plain
        style={{ height: '100%' }}
        onClick={() => {
          props.onClick();
        }}>
        <Box {...internalBoxProps}>
          {React.cloneElement(icon, { size: 24 })}
          <Box justify="center">
            <Text size="small">{label}</Text>
          </Box>
        </Box>
      </AppButton>
    </Box>
  );
};

export const GlobalNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const posthog = usePostHog();
  const { mobile } = useResponsive();

  const pageIx = locationToPageIx(location);

  const handleNavClick = (route: string) => {
    if (route === AbsoluteRoutes.MyPosts) {
      posthog?.capture(POSTHOG_EVENTS.CLICKED_YOUR_POSTS_TAB);
    }
    if (route === AbsoluteRoutes.Settings) {
      posthog?.capture(POSTHOG_EVENTS.CLICKED_SETTINGS_TAB);
    }

    navigate(route);
  };

  if (!mobile) {
    return (
      <Box style={{ flexGrow: 1 }}>
        <Box style={{ flexGrow: 1 }}>
          <AppHeading level="2" style={{ padding: '16px' }}>
            Hyperfeeds
          </AppHeading>
          <ClustersMenu></ClustersMenu>
        </Box>
        <Box align="start">
          <NavButton
            key="0"
            label={t(AppGeneralKeys.myPosts)}
            icon={<DraftsIcon></DraftsIcon>}
            onClick={() => handleNavClick(AbsoluteRoutes.MyPosts)}
            isSelected={pageIx === 0}></NavButton>
          <NavButton
            key="2"
            label={t(AppGeneralKeys.settings)}
            icon={<SettignsIcon></SettignsIcon>}
            onClick={() => handleNavClick(AbsoluteRoutes.Settings)}
            isSelected={pageIx === 2}></NavButton>
        </Box>
      </Box>
    );
  }

  return <></>;
};

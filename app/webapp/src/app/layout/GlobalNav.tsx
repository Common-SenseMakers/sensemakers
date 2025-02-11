import { Box, BoxExtendedProps, Text } from 'grommet';
import { usePostHog } from 'posthog-js/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Location,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { POSTHOG_EVENTS } from '../../analytics/posthog.events';
import { AppGeneralKeys } from '../../i18n/i18n.app.general';
import { ClustersMenu } from '../../posts.fetcher/ClustersMenu';
import { ALL_CLUSTER_NAME } from '../../posts.fetcher/cluster.context';
import { AbsoluteRoutes, RouteNames } from '../../route.names';
import { AppButton, AppCircleButton } from '../../ui-components';
import { useResponsive } from '../../ui-components/ResponsiveApp';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { useAccountContext } from '../../user-login/contexts/AccountContext';
import { ClusterIcon } from '../icons/ClusterIcon';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { connectedUser, signIn } = useAccountContext();

  const notFeed = !location.pathname.includes(RouteNames.Feed);

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

  const showProfiles = () => {
    if (searchParams.has('details')) {
      searchParams.delete('details');
    } else {
      searchParams.set('details', 'true');
    }
    setSearchParams(searchParams);
  };

  const backToHyperfeed = () => {
    navigate(AbsoluteRoutes.ClusterFeed(ALL_CLUSTER_NAME));
  };

  const userButtons = connectedUser ? (
    !mobile ? (
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
    ) : (
      <Box direction="row" align="center" gap="8px">
        <AppCircleButton
          onClick={() => handleNavClick(AbsoluteRoutes.MyPosts)}
          icon={<DraftsIcon color="white"></DraftsIcon>}></AppCircleButton>
        <AppCircleButton
          onClick={() => handleNavClick(AbsoluteRoutes.Settings)}
          icon={<SettignsIcon color="white"></SettignsIcon>}></AppCircleButton>
      </Box>
    )
  ) : (
    <Box pad="small">
      <AppButton label="Sign In" onClick={() => signIn()}></AppButton>
    </Box>
  );

  if (!mobile) {
    return (
      <Box style={{ flexGrow: 1 }}>
        <Box style={{ flexGrow: 1 }}>
          <ClustersMenu></ClustersMenu>
        </Box>
        {userButtons}
      </Box>
    );
  }

  return (
    <Box
      width={'100%'}
      direction="row"
      justify="between"
      pad={{ left: '20px', right: '10px' }}>
      {userButtons}
      {notFeed ? (
        <AppButton
          label="hyperfeed"
          onClick={() => backToHyperfeed()}></AppButton>
      ) : (
        <Box direction="row" align="center" gap="8px">
          <AppCircleButton
            onClick={() => showProfiles()}
            icon={
              searchParams.get('details') === 'true' ? (
                <FeedIcon color="white"></FeedIcon>
              ) : (
                <ClusterIcon color="white"></ClusterIcon>
              )
            }></AppCircleButton>
          <ClustersMenu></ClustersMenu>
        </Box>
      )}
    </Box>
  );
};

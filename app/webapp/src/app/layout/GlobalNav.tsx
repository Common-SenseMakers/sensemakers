import { Box, BoxExtendedProps, Text } from 'grommet';
import { usePostHog } from 'posthog-js/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

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
import { useDetailsParams } from './details.params.hook';

export const SHOW_DETAILS_QUERY_PARAM = 'details';

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
    pad: mobile ? 'none' : { vertical: '12px' },
  };

  const externalBoxProps: BoxExtendedProps = {
    style: {
      flexGrow: 1,
      height: '100%',
      justifyContent: 'center',
    },
  };

  const color = isSelected
    ? constants.colors.primary
    : constants.colors.textLight;

  return (
    <Box {...externalBoxProps}>
      <AppButton
        plain
        style={{ height: '100%' }}
        onClick={() => {
          props.onClick();
        }}>
        <Box {...internalBoxProps}>
          {React.cloneElement(icon, {
            size: 24,
            color: color,
          })}
          <Box justify="center">
            <Text color={color} size="small">
              {label}
            </Text>
          </Box>
        </Box>
      </AppButton>
    </Box>
  );
};

export const GlobalNav = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { connectedUser, signIn } = useAccountContext();
  const { toggleDetails, showingDetails } = useDetailsParams();

  const notFeed = !location.pathname.includes(RouteNames.Feed);

  const posthog = usePostHog();
  const { mobile } = useResponsive();

  const handleNavClick = (route: string) => {
    if (route === AbsoluteRoutes.MyPosts) {
      posthog?.capture(POSTHOG_EVENTS.CLICKED_YOUR_POSTS_TAB);
    }
    if (route === AbsoluteRoutes.Settings) {
      posthog?.capture(POSTHOG_EVENTS.CLICKED_SETTINGS_TAB);
    }

    navigate(route);
  };

  const backToHyperfeed = () => {
    navigate(AbsoluteRoutes.ClusterFeed(ALL_CLUSTER_NAME));
  };

  const isFeed = location.pathname.startsWith(`/${RouteNames.Feed}`);

  const isUserPosts =
    location.pathname === '/' ||
    location.pathname.startsWith(`/${RouteNames.MyPosts}`);

  const isSettings = location.pathname.startsWith(`/${RouteNames.Settings}`);

  const userButtons = !mobile ? (
    <Box align="start">
      <NavButton
        key="0"
        label={t(AppGeneralKeys.feedTitle)}
        icon={<FeedIcon selected={isFeed}></FeedIcon>}
        onClick={() => backToHyperfeed()}
        isSelected={isFeed}></NavButton>
      <NavButton
        key="0"
        label={t(AppGeneralKeys.myPosts)}
        icon={<DraftsIcon selected={isUserPosts}></DraftsIcon>}
        onClick={() => handleNavClick(AbsoluteRoutes.MyPosts)}
        isSelected={isUserPosts}></NavButton>
      <NavButton
        key="2"
        label={t(AppGeneralKeys.settings)}
        icon={<SettignsIcon></SettignsIcon>}
        onClick={() => handleNavClick(AbsoluteRoutes.Settings)}
        isSelected={isSettings}></NavButton>
    </Box>
  ) : (
    <Box
      style={{
        borderRadius: '40px',
        background: 'rgba(255, 255, 255, 0.10)',
        backdropFilter: 'blur(8px)',
      }}
      direction="row"
      align="center"
      gap="8px"
      pad="8px">
      {!connectedUser ? (
        <AppButton
          style={{ borderRadius: '30px', padding: '15px 25px' }}
          primary
          label="Sign In"
          onClick={() => signIn()}></AppButton>
      ) : (
        <>
          <AppCircleButton
            onClick={() => handleNavClick(AbsoluteRoutes.Settings)}
            icon={
              <SettignsIcon
                size={34}
                color={constants.colors.textLight}></SettignsIcon>
            }></AppCircleButton>
          <AppCircleButton
            onClick={() => handleNavClick(AbsoluteRoutes.MyPosts)}
            icon={<DraftsIcon size={34}></DraftsIcon>}></AppCircleButton>
        </>
      )}
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
        <Box
          style={{
            borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(8px)',
          }}
          justify="end"
          direction="row"
          align="center"
          gap="8px"
          pad="8px">
          <AppCircleButton
            onClick={() => toggleDetails()}
            icon={
              showingDetails ? (
                <FeedIcon
                  color={constants.colors.textLight}
                  size={34}></FeedIcon>
              ) : (
                <ClusterIcon
                  color={constants.colors.textLight}
                  size={34}></ClusterIcon>
              )
            }></AppCircleButton>
          <ClustersMenu></ClustersMenu>
        </Box>
      )}
    </Box>
  );
};

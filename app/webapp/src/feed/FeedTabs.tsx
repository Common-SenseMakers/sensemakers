import { Box, BoxExtendedProps, Text } from 'grommet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate } from 'react-router-dom';

import { RouteNames } from '../route.names';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { feedTabs } from './feed.config';

const DEBUG = false;

export const locationToPageIx = (location: Location) => {
  if (DEBUG) console.log(location);

  const pageIx = feedTabs.findIndex((tab) =>
    location.pathname.startsWith(`/feed/${tab.id}`)
  );

  if (pageIx === -1) {
    return 0;
  } else {
    return pageIx;
  }
};

export const FeedTabs = (props: {}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const pageIx = locationToPageIx(location);

  const tabElement = (text: string, route: string, isSelected: boolean) => {
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
        side: 'bottom',
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
      {feedTabs.map((tab, ix) =>
        tabElement(tab.title, `/${RouteNames.Feed}/${tab.id}`, pageIx === ix)
      )}
    </Box>
  );
};

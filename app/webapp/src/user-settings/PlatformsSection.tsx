import { Box, Text } from 'grommet';
import { usePostHog } from 'posthog-js/react';

import { POSTHOG_EVENTS } from '../analytics/posthog.events';
import { CheckIcon } from '../app/icons/FilterIcon copy';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PlatformConnectedStatus } from '../user-login/contexts/AccountContext';

export const PlatformSection = (props: {
  icon: JSX.Element;
  platformName: string;
  username: string;
  buttonText: string;
  onButtonClicked: () => void;
  platformStatus: PlatformConnectedStatus | undefined | null;
  disabled?: boolean;
  isValidInput?: (input: string) => boolean;
}) => {
  const { constants } = useThemeContext();
  const posthog = usePostHog();

  return (
    <Box
      pad={{ horizontal: '16px', vertical: '16px' }}
      direction="row"
      align="center"
      style={{
        border: `1px solid ${constants.colors.border}`,
        position: 'relative',
      }}>
      <Box style={{ width: '50px' }}>{props.icon}</Box>
      <Box
        style={{
          flexGrow: 1,
          fontSize: '16px',
          lineHeight: '18px',
          fontWeight: 600,
        }}
        margin={{ horizontal: '8px' }}>
        <Box>
          <Text>{props.platformName}</Text>
        </Box>
        <Box>
          {(props.platformStatus === PlatformConnectedStatus.Connected ||
            props.platformStatus ===
              PlatformConnectedStatus.ReconnectRequired) && (
            <Text
              style={{ fontWeight: 500, color: constants.colors.textLight2 }}>
              {props.username}
            </Text>
          )}
        </Box>
      </Box>
      <Box style={{ position: 'absolute', right: 12 }}>
        {props.platformStatus !== PlatformConnectedStatus.Connected ? (
          <AppButton
            color={
              props.platformStatus === PlatformConnectedStatus.ReconnectRequired
                ? '#F2994A'
                : undefined
            }
            disabled={
              props.platformStatus === PlatformConnectedStatus.Connecting
            }
            label={
              props.platformStatus === PlatformConnectedStatus.Connecting
                ? 'connecting'
                : props.platformStatus ===
                    PlatformConnectedStatus.ReconnectRequired
                  ? 'reconnect'
                  : props.buttonText
            }
            onClick={() => {
              posthog?.capture(
                POSTHOG_EVENTS.CLICKED_CONNECT_PLATFORM_ACCOUNT,
                {
                  platform: props.platformName,
                }
              );
              props.onButtonClicked();
            }}
            style={
              props.platformStatus === PlatformConnectedStatus.ReconnectRequired
                ? {
                    color: '#F2994A',
                  }
                : undefined
            }
          />
        ) : (
          <Box
            direction="row"
            align="center"
            gap="4px"
            pad="small"
            style={{
              width: 'fit-content',
              backgroundColor: constants.colors.shade,
              flexShrink: 0,
            }}>
            <CheckIcon></CheckIcon>
            <Text
              style={{
                fontSize: '12px',
                lineHeight: '14px',
                color: '#038153',
                flexShrink: 0,
              }}>
              Connected
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

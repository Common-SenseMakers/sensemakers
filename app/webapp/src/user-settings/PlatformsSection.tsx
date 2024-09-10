import { Box, Text } from 'grommet';

import { CheckIcon } from '../app/icons/FilterIcon copy';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

export const PlatformSection = (props: {
  icon: JSX.Element;
  platformName: string;
  username: string;
  buttonText: string;
  onButtonClicked: () => void;
  connected: boolean;
  connecting?: boolean;
  isMastodon?: boolean;
  mastodonDomain?: string;
  onMastodonDomainChange?: (domain: string) => void;
}) => {
  const { constants } = useThemeContext();

  return (
    <Box
      pad={{ horizontal: '16px', vertical: '16px' }}
      direction="row"
      align="center"
      style={{ border: `1px solid ${constants.colors.border}` }}>
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
          {props.isMastodon && !props.connected ? (
            <AppInput
              placeholder="Enter Mastodon server"
              value={props.mastodonDomain}
              onChange={(event) => props.onMastodonDomainChange && props.onMastodonDomainChange(event.target.value)}
              style={{ width: '100%' }}
            />
          ) : (
            <Text style={{ fontWeight: 500, color: constants.colors.textLight2 }}>
              {props.username}
            </Text>
          )}
        </Box>
      </Box>
      <Box>
        {!props.connected ? (
          <AppButton
            disabled={props.connecting || (props.isMastodon && !isValidMastodonDomain(props.mastodonDomain || ''))}
            label={props.connecting ? 'connecting' : props.buttonText}
            onClick={() => props.onButtonClicked()}></AppButton>
        ) : (
          <Box
            direction="row"
            align="center"
            gap="4px"
            pad={{ horizontal: 'small' }}>
            <CheckIcon></CheckIcon>
            <Text
              style={{
                fontSize: '12px',
                lineHeight: '14px',
                color: '#038153',
              }}>
              Connected
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

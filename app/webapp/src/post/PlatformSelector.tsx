import { Box, BoxExtendedProps, ButtonExtendedProps } from 'grommet';
import { Checkmark, Clear } from 'grommet-icons';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

import { useAccountContext } from '../app/AccountContext';
import { AppAddress } from '../app/AppAddress';
import { PLATFORM } from '../shared/types';
import { AppButton, AppButtonTwoLinesLabel } from '../ui-components';
import { useResponsive } from '../ui-components/ResponsiveApp';
import { useThemeContext } from '../ui-components/ThemedApp';

const PlatformButton = (props: ButtonExtendedProps & { enabled: boolean }) => {
  const { constants } = useThemeContext();

  const iconColor = props.enabled
    ? constants.colors.textOnPrimary
    : constants.colors.backgroundLightDarker;

  const disabledStyle: React.CSSProperties = !props.enabled
    ? {
        color: constants.colors.backgroundLightDarker,
        borderColor: constants.colors.backgroundLightDarker,
      }
    : {};

  return (
    <AppButton
      icon={
        props.enabled ? (
          <Checkmark color={iconColor}></Checkmark>
        ) : (
          <Clear color={iconColor}></Clear>
        )
      }
      primary={props.enabled}
      {...props}
      style={{
        textTransform: 'none',
        ...disabledStyle,
        ...props.style,
      }}></AppButton>
  );
};

export const PlatformSelector = (
  props: BoxExtendedProps & {
    onChanged?: (platforms: PLATFORM[]) => void;
  }
) => {
  const { mobile } = useResponsive();
  const { connectedUser } = useAccountContext();
  const [platforms, setPlatforms] = useState<PLATFORM[]>([
    PLATFORM.X,
    PLATFORM.Nanopubs,
  ]);

  const select = (platform: PLATFORM) => {
    if (platforms.includes(platform)) {
      platforms.splice(platforms.indexOf(platform), 1);
    } else {
      platforms.push(platform);
    }
    setPlatforms([...platforms]);
  };

  useEffect(() => {
    if (props.onChanged) {
      props.onChanged(platforms);
    }
  }, [platforms]);

  const canTwitter = (connectedUser && connectedUser.twitter) !== undefined;
  const willTwitter = canTwitter && platforms.includes(PLATFORM.X);

  const canNano = (connectedUser && connectedUser.eth) !== undefined;
  const willNano = canNano && platforms.includes(PLATFORM.Nanopubs);

  return (
    <Box
      direction={mobile ? 'column' : 'row'}
      gap="medium"
      justify="center"
      {...props}>
      <PlatformButton
        style={{ flexGrow: 1 }}
        enabled={willTwitter}
        justify="start"
        onClick={() => select(PLATFORM.X)}
        pad={{ vertical: 'xsmall', horizontal: 'medium' }}
        label={
          <AppButtonTwoLinesLabel
            tag={t('twitter/x')}
            label={`@${connectedUser?.twitter?.screen_name}`}></AppButtonTwoLinesLabel>
        }></PlatformButton>
      <PlatformButton
        style={{ flexGrow: 1 }}
        enabled={willNano}
        onClick={() => select(PLATFORM.Nanopubs)}
        justify="start"
        pad={{ vertical: 'xsmall', horizontal: 'medium' }}
        label={
          <AppButtonTwoLinesLabel
            tag={t('nanopub')}
            label={
              <AppAddress
                asText
                address={connectedUser?.eth?.ethAddress}></AppAddress>
            }></AppButtonTwoLinesLabel>
        }></PlatformButton>
    </Box>
  );
};

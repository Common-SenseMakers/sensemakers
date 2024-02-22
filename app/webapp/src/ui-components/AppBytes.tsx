import { Box, BoxExtendedProps } from 'grommet';
import { Clone } from 'grommet-icons';
import { ReactNode } from 'react';

import { AppLabel } from './AppLabel';
import { HelpTip } from './HelpTip';
import { useThemeContext } from './ThemedApp';

export interface IBytesInfo extends BoxExtendedProps {
  label: ReactNode;
  sublabel?: ReactNode;
  help?: ReactNode;
  bytes: ReactNode;
  bytesText?: string;
  maxWidth?: string;
}

export const AppBytes = (props: IBytesInfo): JSX.Element => {
  const { constants } = useThemeContext();

  let bytesText: string;
  if (typeof props.bytes !== 'string') {
    if (props.bytesText === undefined) {
      console.warn(
        `bytesText must be provided if the bytes props is not a simple string`
      );
      return <></>;
    }

    bytesText = props.bytesText;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bytesText = props.bytes;
  }

  return (
    <Box
      direction="row"
      justify="between"
      align="start"
      style={{ ...props.style }}>
      <Box
        style={{
          flexShrink: '0',
          marginRight: '12px',
          maxWidth: '50%',
          wordWrap: 'break-word',
        }}>
        <Box direction="row" align="center">
          <AppLabel
            style={{
              fontSize: constants.textFontSizes.xsmall,
              marginRight: '10.5px',
            }}>
            {props.label}
          </AppLabel>
          {props.help ? (
            <HelpTip iconSize="15px" _content={props.help} />
          ) : (
            <></>
          )}
        </Box>
        {props.sublabel ? (
          <Box
            style={{
              fontSize: constants.textFontSizes.xsmall,
              fontWeight: '500',
              color: constants.colors.primary,
            }}>
            {props.sublabel}
          </Box>
        ) : (
          <></>
        )}
      </Box>
      <Box
        direction="row"
        align="center"
        style={{
          maxWidth: '50%',
        }}>
        <Box
          style={{
            wordWrap: 'break-word',
            textAlign: 'right',
            fontSize: constants.textFontSizes.small,
            fontWeight: '500',
          }}>
          {props.bytes}
        </Box>
        <Box style={{ padding: '0px 16px' }} onClick={(): void => {}}>
          <Clone color={constants.colors.links}></Clone>
        </Box>
      </Box>
    </Box>
  );
};

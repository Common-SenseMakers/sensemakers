import { Box, BoxExtendedProps } from 'grommet';
import { FormDown, FormUp, Refresh } from 'grommet-icons';
import React, { PropsWithChildren, useState } from 'react';

import { useThemeContext } from './ThemedApp';
import { StyleConstants } from './themes';

export interface AppCardProps extends PropsWithChildren {
  boxProps?: BoxExtendedProps;
  reloading?: boolean;
  onReload?: () => void;
}

const cardStyle = (constants: StyleConstants): React.CSSProperties => {
  return {
    backgroundColor: 'white',
    padding: '16px 24px',
    borderRadius: '6px',
  };
};

export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  (props, ref) => {
    const { constants } = useThemeContext();
    const { boxProps } = props;

    const showReload = props.onReload !== undefined;
    return (
      <Box
        {...boxProps}
        ref={ref}
        style={{
          position: 'relative',
          ...cardStyle(constants),
          ...(boxProps || {}).style,
        }}>
        {props.children}
        {showReload ? (
          <Box
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              height: '20px',
              width: '20px',
            }}
            onClick={(): void => {
              if (props.onReload) {
                props.onReload();
              }
            }}>
            <Refresh
              color={constants.colors.primary}
              style={{ height: '20px', width: '20px' }}></Refresh>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    );
  }
);

interface IExpansibleCard extends BoxExtendedProps {
  hiddenPart: React.ReactElement | React.ReactElement[];
}

export const ExpansibleCard = (props: IExpansibleCard): JSX.Element => {
  const { constants } = useThemeContext();

  const [expanded, setExpanded] = useState(false);

  const circleStyle: React.CSSProperties = {
    borderRadius: '15px',
    border: 'solid 1px',
    backgroundColor: 'white',
    height: '30px',
    width: '27px',
  };

  const iconStyle: React.CSSProperties = { height: '20px', width: '20px' };

  return (
    <Box
      {...props}
      style={{
        ...cardStyle(constants),
        ...props.style,
      }}>
      {props.children}
      {expanded ? props.hiddenPart : <></>}

      <Box
        fill
        align="center"
        onClick={(): void => setExpanded(!expanded)}
        style={{
          marginTop: '15px',
          height: '30px',
          paddingTop: '3px',
          bottom: '-15px',
          cursor: 'pointer',
          width: `100%`,
        }}>
        {expanded ? (
          <Box align="center" justify="center" style={{ ...circleStyle }}>
            <FormUp style={{ ...iconStyle }}></FormUp>
          </Box>
        ) : (
          <Box align="center" justify="center" style={{ ...circleStyle }}>
            <FormDown style={{ ...iconStyle }}></FormDown>
          </Box>
        )}
      </Box>
    </Box>
  );
};

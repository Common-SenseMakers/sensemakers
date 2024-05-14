import { Box, BoxExtendedProps } from 'grommet';
import React, { ReactElement } from 'react';

import { useThemeContext } from './ThemedApp';

export interface ICircleIcon extends BoxExtendedProps {
  icon: ReactElement;
  size?: number;
}

export const CircleIcon = (props: ICircleIcon): JSX.Element => {
  const { constants } = useThemeContext();

  const size = props.size || 40;
  const icon = React.cloneElement(props.icon, {
    color: props.color || constants.colors.primary,
    size: `${size * 0.5}px`,
  });
  return (
    <Box
      justify="center"
      align="center"
      style={{
        height: `${size}px`,
        width: `${size}px`,
        borderRadius: `${size / 2}px`,
        overflow: 'hidden',
        ...props.style,
      }}>
      {icon}
    </Box>
  );
};

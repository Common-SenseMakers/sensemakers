import { Box, BoxExtendedProps, Select, SelectExtendedProps } from 'grommet';
import React from 'react';

import { useThemeContext } from './ThemedApp';

export const AppSelect = React.forwardRef<
  HTMLInputElement,
  SelectExtendedProps
>((props, ref): JSX.Element => {
  return (
    <Select
      {...props}
      ref={ref}
      style={{
        border: 'none',
        ...props.style,
      }}></Select>
  );
});

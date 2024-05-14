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

export const SelectRow = (props: BoxExtendedProps): JSX.Element => {
  return (
    <Box
      direction="row"
      align="center"
      style={{ width: '100%', padding: '6px 12px', ...props.style }}>
      {props.children}
    </Box>
  );
};

export const SelectValue = (props: BoxExtendedProps): JSX.Element => {
  const { constants } = useThemeContext();

  return (
    <SelectRow
      style={{
        border: '1px solid',
        borderRadius: '32px',
        borderColor: constants.colors.border,
        ...props.style,
      }}>
      {props.children}
    </SelectRow>
  );
};

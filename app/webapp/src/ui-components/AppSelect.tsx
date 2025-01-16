import { Select, SelectExtendedProps } from 'grommet';
import React from 'react';

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
        padding: '0',
        ...props.style,
      }}></Select>
  );
});

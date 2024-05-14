import { TextInput, TextInputProps } from 'grommet';
import React from 'react';

export const AppInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref): JSX.Element => {
    return (
      <TextInput
        {...props}
        ref={ref}
        style={{
          border: 'none',
          borderRadius: '0px',
          height: '36px',
          paddingLeft: '16px',
          fontWeight: 'normal',
          width: 'auto',
          ...props.style,
        }}></TextInput>
    );
  }
);

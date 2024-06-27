import { TextInput, TextInputProps } from 'grommet';
import React from 'react';

export const AppInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref): JSX.Element => {
    return (
      <TextInput
        {...props}
        ref={ref}
        style={{
          border: '1px solid var(--Neutral-200, #E5E7EB)',
          borderRadius: '8px',
          boxShadow:
            '0px 1px 2px 0px rgba(16, 24, 40, 0.04), 0px 1px 2px 0px rgba(16, 24, 40, 0.04)',
          height: '40px',
          paddingLeft: '16px',
          fontWeight: 'normal',
          width: 'auto',
          ...props.style,
        }}></TextInput>
    );
  }
);

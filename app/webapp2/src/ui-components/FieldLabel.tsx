import { Box, BoxExtendedProps } from 'grommet';
import { ReactElement } from 'react';
import { HelpTip } from './HelpTip';

export interface IFieldLabel extends BoxExtendedProps {
  label: string;
  required?: boolean;
  help?: string | ReactElement;
}

export const FieldLabel = (props: IFieldLabel) => {
  const required = props.required !== undefined ? props.required : false;

  return (
    <Box direction="row" align="center" style={{ ...props.style }}>
      <Box style={{ marginRight: '4px' }}>
        <span>
          {required ? <span style={{ color: 'red', marginRight: '4px' }}>*</span> : <></>}
          {props.label}
        </span>
      </Box>
      {props.help ? <HelpTip _content={props.help}></HelpTip> : <></>}
    </Box>
  );
};

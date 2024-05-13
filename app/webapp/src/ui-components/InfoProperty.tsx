import { Box, BoxExtendedProps } from 'grommet';

import { AppLabel } from './AppLabel';

export interface IInfoProperty extends BoxExtendedProps {
  title: string;
}

export const InfoProperty = (props: IInfoProperty) => {
  return (
    <Box style={{ ...props.style }}>
      <AppLabel style={{ marginBottom: '12px' }} color="black">
        {props.title}
      </AppLabel>
      <Box>{props.children}</Box>
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';

import { AppIcon } from './AppIcon';

export const AppLogo = (props: BoxExtendedProps) => {
  return (
    <Box direction="row" align="center" gap="4px" {...props}>
      <AppIcon></AppIcon>
      <Text weight={600}>sensenet</Text>
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';

import { useThemeContext } from '../../ui-components/ThemedApp';
import { AppIcon } from '../icons/AppIcon';

export const AppLogo = (props: BoxExtendedProps) => {
  const { constants } = useThemeContext();
  return (
    <Box direction="row" align="center" gap="4px" {...props}>
      <AppIcon></AppIcon>
      <Text weight={600} color={constants.colors.primary}>
        sensenet
      </Text>
    </Box>
  );
};

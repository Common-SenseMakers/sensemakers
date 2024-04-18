import { Box, BoxExtendedProps } from 'grommet';

import { useThemeContext } from './ThemedApp';

export const HorizontalLine = (props: BoxExtendedProps): JSX.Element => {
  const { constants } = useThemeContext();

  return (
    <Box
      style={{
        width: '100%',
        height: '1px',
        backgroundColor: `${constants.colors.text}`,
        ...props.style,
      }}></Box>
  );
};

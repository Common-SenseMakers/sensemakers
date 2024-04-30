import { Box, BoxExtendedProps } from 'grommet';

import { useThemeContext } from './ThemedApp';

export const AppTag = (props: BoxExtendedProps): JSX.Element => {
  const { constants } = useThemeContext();

  return (
    <Box
      direction="row"
      align="center"
      style={{
        borderRadius: '30px',
        backgroundColor: constants.colors.backgroundLight,
        padding: '6.5px 16px',
        fontSize: '10px',
        ...props.style,
      }}>
      {props.children}
    </Box>
  );
};

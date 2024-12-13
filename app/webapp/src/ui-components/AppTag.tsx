import { Box, BoxExtendedProps } from 'grommet';

export const AppTag = (props: BoxExtendedProps): JSX.Element => {
  return (
    <Box
      direction="row"
      align="center"
      style={{
        borderRadius: '30px',
        padding: '6.5px 16px',
        fontSize: '10px',
        ...props.style,
      }}>
      {props.children}
    </Box>
  );
};

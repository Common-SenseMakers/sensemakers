import { Box, BoxExtendedProps, Text } from 'grommet';

import { useThemeContext } from './ThemedApp';

interface INumberedRow extends BoxExtendedProps {
  number: number;
  text: React.ReactNode;
  disabled?: boolean;
  hideLine?: boolean;
}

export const NumberedRow = (props: INumberedRow): JSX.Element => {
  const { constants } = useThemeContext();

  return (
    <Box direction="row" style={{ ...props.style }}>
      <Box style={{ width: '28px', marginRight: '24px' }}>
        <Box
          style={{
            flexShrink: 0,
            width: '24px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: props.disabled
              ? constants.colors.primaryLight
              : constants.colors.backgroundLight,
            color: props.disabled ? '#6D6D6D' : constants.colors.primary,
            textAlign: 'center',
          }}>
          {props.number}
        </Box>
        <Box fill style={{ padding: '8px 0px' }} align="center">
          {props.hideLine ? (
            <></>
          ) : (
            <Box
              fill
              style={{
                width: '1px',
                backgroundColor: '#ccc',
              }}></Box>
          )}
        </Box>
      </Box>
      <Box fill>
        <Text>{props.text}</Text>
        <Box style={{ padding: '16px 0px 40px 0px' }}>{props.children}</Box>
      </Box>
    </Box>
  );
};

import { Box, BoxExtendedProps, Text } from 'grommet';
import { Close } from 'grommet-icons';

import { AppButton } from './AppButton';
import { useThemeContext } from './ThemedApp';

export const AppLabel = (
  props: BoxExtendedProps & {
    showClose?: boolean;
    remove?: () => void;
    color: string;
  }
): JSX.Element => {
  const color = props.color;
  const { constants } = useThemeContext();

  const remove = () => {
    if (props.remove) {
      props.remove();
    }
  };

  return (
    <Box
      pad={{ horizontal: '8px', vertical: '4px' }}
      {...props}
      style={{
        borderRadius: '24px',
        color: 'white',
        backgroundColor: color,
        textAlign: 'center',
        ...props.style,
      }}
      direction="row"
      align="center">
      <Box direction="row" align="center">
        <Text
          id="text"
          style={{
            height: '16px',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '16px',
          }}
          size="small">
          {props.children}
        </Text>
        {props.showClose ? (
          <AppButton margin={{ left: '8px' }} plain onClick={() => remove()}>
            <Box justify="center">
              <Close
                color={constants.colors.textOnPrimary}
                size="small"></Close>
            </Box>
          </AppButton>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

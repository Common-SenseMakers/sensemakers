import { Box, BoxExtendedProps, Text } from 'grommet';
import { Close } from 'grommet-icons';

import { AppButton } from './AppButton';

export interface LabelColors {
  font: string;
  border: string;
  background: string;
}

export const AppLabel = (
  props: BoxExtendedProps & {
    showClose?: boolean;
    remove?: () => void;
    colors: LabelColors;
    underline?: boolean;
  }
): JSX.Element => {
  const colors = props.colors;

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
        ...props.style,
        borderRadius: '24px',
        backgroundColor: colors.background,
        color: colors.border,
        border: '1px solid',
        textAlign: 'center',
      }}
      direction="row"
      align="center">
      <Box direction="row" align="center">
        <Text
          id="text"
          style={{
            color: colors.font,
            height: '16px',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '16px',
            userSelect: 'none',
            textDecoration: props.underline ? 'underline' : 'none',
          }}
          size="small">
          {props.children}
        </Text>
        {props.showClose ? (
          <AppButton margin={{ left: '8px' }} plain onClick={() => remove()}>
            <Box justify="center">
              <Close color={colors.font} size={'12px'}></Close>
            </Box>
          </AppButton>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

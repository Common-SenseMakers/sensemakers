import { Box, BoxExtendedProps, Text } from 'grommet';
import { Close } from 'grommet-icons';
import { CSSProperties } from 'styled-components';

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
    large?: boolean;
  }
): JSX.Element => {
  const colors = props.colors;

  const remove = () => {
    if (props.remove) {
      props.remove();
    }
  };

  const fontStyle: CSSProperties = !props.large
    ? {
        height: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '16px',
      }
    : {
        height: '30px',
        fontSize: '22px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '28px',
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
      <Box
        direction="row"
        align="center"
        pad={props.large ? { horizontal: '8px' } : {}}>
        <Text
          id="text"
          style={{
            color: colors.font,
            userSelect: 'none',
            textDecoration: props.underline ? 'underline' : 'none',
            ...fontStyle,
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

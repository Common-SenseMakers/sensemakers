import { Box, BoxExtendedProps, Text } from 'grommet';
import { Close } from 'grommet-icons';

import { AppButton } from './AppButton';
import { useThemeContext } from './ThemedApp';

export const AppLabel = (
  props: BoxExtendedProps & { showClose?: boolean; remove?: () => void }
): JSX.Element => {
  const { constants } = useThemeContext();

  const remove = () => {
    if (props.remove) {
      props.remove();
    }
  };

  return (
    <Box
      pad={{ left: 'medium', right: props.showClose ? '0' : 'medium' }}
      {...props}
      style={{
        width: 'fit-content',
        backgroundColor: constants.colors.tagsBackground,
        fontSize: '14px',
        color: constants.colors.tagsText,
        fontWeight: '700',
        borderRadius: '6px',
        height: '36px',
        ...props.style,
      }}
      direction="row"
      align="center">
      <Box direction="row" align="center">
        <Text size="small">{props.children}</Text>
        {props.showClose ? (
          <AppButton plain onClick={() => remove()}>
            <Box
              pad={{ left: 'small', right: 'medium' }}
              style={{ height: '36px' }}
              justify="center">
              <Close color={constants.colors.tagsText} size="small"></Close>
            </Box>
          </AppButton>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

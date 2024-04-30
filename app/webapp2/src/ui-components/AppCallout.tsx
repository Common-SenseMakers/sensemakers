import { Box, BoxExtendedProps } from 'grommet';
import { CircleQuestion, Validate } from 'grommet-icons';

import { useThemeContext } from './ThemedApp';

export interface IAppCallout extends BoxExtendedProps {
  _type?: 'normal' | 'success';
  noIcon?: boolean;
}

export const AppCallout = (props: IAppCallout): JSX.Element => {
  const { constants } = useThemeContext();

  const type = props._type ? props._type : 'normal';
  const showIcon = props.noIcon !== undefined ? !props.noIcon : true;

  const color =
    type === 'normal'
      ? constants.colors.backgroundLight
      : constants.colors.primaryLight;
  return (
    <Box
      direction="row"
      align="center"
      style={{
        backgroundColor: color,
        fontSize: constants.textFontSizes.small,
        borderRadius: '8px',
        padding: '14.5px 28px 14.5px 14.5px',
        ...props.style,
      }}>
      {showIcon ? (
        <Box style={{ marginRight: '20px' }}>
          {type === 'normal' ? (
            <CircleQuestion></CircleQuestion>
          ) : (
            <Validate></Validate>
          )}
        </Box>
      ) : (
        <></>
      )}

      {props.children}
    </Box>
  );
};

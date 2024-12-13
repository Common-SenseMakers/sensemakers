import { Box, Text } from 'grommet';

import { AppButton } from '../ui-components';

export const NavButton = (props: {
  icon: JSX.Element;
  label: string;
  reverse?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => {
  const { reverse: _reverse } = props;
  const reverse = _reverse !== undefined ? _reverse : false;

  const { left, right } = (() => {
    const icon = props.icon;
    const text = (
      <Text
        style={{
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '16px',
        }}>
        {props.label}
      </Text>
    );

    return reverse ? { right: icon, left: text } : { left: icon, right: text };
  })();

  return (
    <AppButton
      plain
      disabled={props.disabled}
      onClick={() => (props.onClick ? props.onClick() : '')}>
      <Box
        direction="row"
        align="center"
        pad={{ vertical: '10px', horizontal: '4px' }}
        gap="8px">
        {left}
        {right}
      </Box>
    </AppButton>
  );
};

import { Box, Text } from 'grommet';

import { ClearIcon } from '../app/icons/ClearIcon';
import { CARD_BORDER } from '../post/PostCard';
import { AppButton } from './AppButton';

export const Banner = (props: {
  text: string;
  backgroundColor?: string;
  color?: string;
  onClose?: () => void;
  icon?: JSX.Element | string;
}) => {
  return (
    <Box
      direction="row"
      pad="medium"
      gap="28px"
      style={{
        borderBottom: CARD_BORDER,
        backgroundColor: props.backgroundColor,
        flexShrink: 0,
      }}>
      {props.icon}
      <Box style={{ flexGrow: 1 }}>
        <Text
          style={{
            color: props.color,
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '16px',
          }}>
          {props.text}
        </Text>
      </Box>
      {props.icon}
      {props.onClose && (
        <AppButton plain onClick={props.onClose}>
          <Box style={{ width: '28px', flexShrink: 0 }} justify="center">
            <ClearIcon circle={false} size={20}></ClearIcon>
          </Box>
        </AppButton>
      )}
    </Box>
  );
};

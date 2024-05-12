import { Box, Text } from 'grommet';

import { AppIcon } from '../app/icons/AppIcon';
import { NanopubIcon } from '../app/icons/NanopubIcon';

export const StatusTag = (props: { label: string }) => {
  const { label } = props;
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      style={{
        borderRadius: '4px',
        border: '1px solid #D1D5DB',
        height: '20px',
        padding: '2px 4px',
      }}>
      <NanopubIcon size={14}></NanopubIcon>
      <Text
        style={{
          color: '#6B7280',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '16px',
        }}>
        {label}
      </Text>
    </Box>
  );
};

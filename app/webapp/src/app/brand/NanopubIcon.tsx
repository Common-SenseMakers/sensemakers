import { Box, Text } from 'grommet';

export const NanopubIcon = (props: { size?: number }) => {
  const size = props.size || 18;
  return (
    <Box
      style={{
        height: `${size}px`,
        width: `${size}px`,
        borderRadius: '2px',
        backgroundColor: '#F79A3E',
      }}
      align="center"
      justify="center">
      <Text
        style={{
          color: 'white',
          lineHeight: `${size}px`,
          fontWeight: '500',
          fontSize: `${(size * 12.0) / 14.0}px`,
        }}>
        N
      </Text>
    </Box>
  );
};

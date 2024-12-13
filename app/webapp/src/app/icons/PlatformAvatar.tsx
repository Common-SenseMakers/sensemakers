import { Box } from 'grommet';

export const PlatformAvatar = (props: { imageUrl?: string; size?: number }) => {
  const size = props.size || 40;
  const content = (() => {
    if (!props.imageUrl) return <></>;

    return (
      <div
        style={{
          width: `100%`,
          height: `100%`,
          background: `url(${props.imageUrl}) lightgray 50% / cover no-repeat`,
          boxSizing: 'border-box',
        }}></div>
    );
  })();

  return (
    <Box
      style={{
        borderRadius: `${size / 2}px`,
        flexShrink: 0,
        height: `${size}px`,
        width: `${size}px`,
      }}
      overflow="hidden">
      {content}
    </Box>
  );
};

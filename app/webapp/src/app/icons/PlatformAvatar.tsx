import { Box, Image } from 'grommet';

export const PlatformAvatar = (props: {
  profileImageUrl?: string;
  size?: number;
}) => {
  const size = props.size || 40;
  const content = (() => {
    if (!props.profileImageUrl) return <></>;
    return <Image src={props.profileImageUrl}></Image>;
  })();

  return (
    <Box
      height={`${size}px`}
      width={`${size}px`}
      style={{ borderRadius: `${size / 2}px`, flexShrink: 0 }}
      overflow="hidden">
      {content}
    </Box>
  );
};

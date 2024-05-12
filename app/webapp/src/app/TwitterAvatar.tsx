import { Box, Image } from 'grommet';
import { UserV2 } from 'twitter-api-v2';

export const TwitterAvatar = (props: { profile?: UserV2; size?: number }) => {
  const size = props.size || 40;
  const content = (() => {
    if (!props.profile || !props.profile.profile_image_url) return <></>;
    return <Image src={props.profile.profile_image_url}></Image>;
  })();

  return (
    <Box
      height={`${size}px`}
      width={`${size}px`}
      style={{ borderRadius: `${size / 2}px` }}
      overflow="hidden">
      {content}
    </Box>
  );
};

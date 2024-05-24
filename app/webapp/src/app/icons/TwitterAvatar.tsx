import { Box, Image } from 'grommet';

import { TwitterUserProfile } from '../../shared/types/types.twitter';

export const TwitterAvatar = (props: {
  profile?: TwitterUserProfile;
  size?: number;
}) => {
  const size = props.size || 40;
  const content = (() => {
    if (!props.profile || !props.profile.profile_image_url) return <></>;
    return <Image src={props.profile.profile_image_url}></Image>;
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

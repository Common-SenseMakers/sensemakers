import { Box, BoxExtendedProps, Image } from 'grommet';

export const TwitterIcon = (
  props: { size?: number; color?: string } & BoxExtendedProps
) => {
  const size = props.size || 20;
  const color = props.color || 'white';
  return (
    <Box
      height={`${size}px`}
      width={`${size}px`}
      align="center"
      justify="center"
      style={{
        borderRadius: `${size / 2}px`,
        backgroundColor: 'black',
      }}>
      <Image src="/icons/x-logo/logo-white.png" height={`${size * 0.6}px`} />
    </Box>
  );
};

export const NanopubsIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 20;
  const color = props.color || 'white';
  return (
    <Box style={{ height: `${size}px`, width: `${size}px` }}>
      <Image src="/icons/nanopub.png" />
    </Box>
  );
};

export const MastodonIcon = (
  props: {
    size?: number;
    color?: 'white' | 'black' | 'purple';
  } & BoxExtendedProps
) => {
  const color = props.color || 'white';
  const size = props.size || 20;

  return (
    <Box
      height={`${size}px`}
      width={`${size}px`}
      align="center"
      justify="center"
      style={{
        borderRadius: `${size / 2}px`,
        backgroundColor: 'black',
      }}>
      <Image src={`/icons/mastodon-${color}.svg`} height={`${size * 0.6}px`} />
    </Box>
  );
};

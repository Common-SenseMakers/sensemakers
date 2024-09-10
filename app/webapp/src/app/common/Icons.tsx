import { Box, BoxExtendedProps, Image } from 'grommet';

export const TwitterIcon = (
  props: { size?: number; color?: string } & BoxExtendedProps
) => {
  const size = props.size || 20;
  const color = props.color || 'white';
  return (
    <Box style={{ height: `${size}px`, width: `${size}px` }}>
      <svg
        style={{ height: '100%', width: 'auto' }}
        width="1200"
        height="1227"
        viewBox="0 0 1200 1227"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
          fill={color}
        />
      </svg>
    </Box>
  );
};

export const NanopubsIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 20;
  const color = props.color || 'white';
  return (
    <Box style={{ height: `${size}px`, width: `${size}px` }}>
      <Image src="/icons/nanopub.png"></Image>
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
    <Box style={{ height: `${size}px`, width: `${size}px` }}>
      <Image src={`/icons/mastodon-${color}.svg`}></Image>
    </Box>
  );
};

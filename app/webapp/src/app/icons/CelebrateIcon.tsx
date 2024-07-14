import { Box, Image } from 'grommet';

export const CelebrateIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Image
      src="/icons/celebrate.png"
      height={props.size}
      width={props.size}></Image>
  );
};

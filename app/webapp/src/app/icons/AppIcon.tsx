import { Box, Image } from 'grommet';

export const AppIcon = (props: { src: string }) => {
  return (
    <Box>
      <Image style={{ height: '20px' }} src={props.src}></Image>
    </Box>
  );
};

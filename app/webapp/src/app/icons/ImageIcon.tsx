import { Image } from 'grommet';

export const ImageIcon = (props: { size?: number; src: string }) => {
  const size = props.size || 18;

  return <Image src={props.src} height={props.size} width={props.size}></Image>;
};

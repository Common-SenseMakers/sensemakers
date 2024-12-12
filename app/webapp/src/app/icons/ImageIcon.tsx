import { Image } from 'grommet';

export const ImageIcon = (props: { size?: number; src: string }) => {
  return <Image src={props.src} height={props.size} width={props.size}></Image>;
};

import { Image } from 'grommet';

export const HmmIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Image src="/icons/hmm.png" height={props.size} width={props.size}></Image>
  );
};

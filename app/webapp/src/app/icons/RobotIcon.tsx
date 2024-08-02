import { Image } from 'grommet';

export const RobotIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Image
      src="/icons/robot.png"
      height={props.size}
      width={props.size}></Image>
  );
};

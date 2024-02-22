import { HeadingExtendedProps, Heading } from 'grommet';

export const AppHeading = (props: HeadingExtendedProps) => {
  return (
    <Heading {...props} style={{ lineHeight: '125%', ...props.style }} weight="700" margin="none">
      {props.children}
    </Heading>
  );
};

import { Heading, HeadingExtendedProps } from 'grommet';

export const AppHeading = (props: HeadingExtendedProps) => {
  return (
    <Heading
      {...props}
      style={{ lineHeight: '125%', ...props.style }}
      weight="700"
      margin="none">
      {props.children}
    </Heading>
  );
};

export const AppSectionHeader = (props: HeadingExtendedProps) => {
  return (
    <AppHeading
      {...props}
      style={{ textTransform: 'uppercase', ...props.style }}>
      {props.children}
    </AppHeading>
  );
};

import {
  Heading,
  HeadingExtendedProps,
  Text,
  TextExtendedProps,
} from 'grommet';

import { useThemeContext } from './ThemedApp';

export const AppHeading = (props: HeadingExtendedProps) => {
  return (
    <Heading
      {...props}
      style={{
        fontWeight: '600',
        lineHeight: '36px',
        letterSpacing: '-0.56px',
        ...props.style,
      }}
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

export const AppSubtitle = (props: TextExtendedProps) => {
  const { constants } = useThemeContext();
  return (
    <Text
      {...props}
      style={{
        fontSize: '18px',
        fontWeight: '500',
        lineHeight: '24px',
        letterSpacing: '-0.36px',
        color: constants.colors.textLight,
        ...props.style,
      }}
      margin="none">
      {props.children}
    </Text>
  );
};

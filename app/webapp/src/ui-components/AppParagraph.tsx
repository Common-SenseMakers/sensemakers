import { Paragraph, ParagraphExtendedProps } from 'grommet';

export const AppParagraph = (
  props: ParagraphExtendedProps & { addMargin?: boolean }
) => {
  return (
    <Paragraph
      {...props}
      style={{
        fontWeight: '400',
        marginTop: props.addMargin ? '24px' : '0px',
        ...props.style,
      }}>
      {props.children}
    </Paragraph>
  );
};

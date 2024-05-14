import { Anchor, Box, Paragraph, Text } from 'grommet';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

export const RefCard = (props: {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  onClick?: () => void;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const descriptionTruncated =
    props.description && truncate(props.description, 90);

  const content = (() => {
    if (!titleTruncated && !descriptionTruncated) {
      const urlTruncated = truncate(props.url, 50);
      return (
        <Anchor href={props.url} target="_blank">
          {urlTruncated}
        </Anchor>
      );
    }

    return (
      <>
        <Text
          style={{
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '16px',
          }}>
          {titleTruncated}
        </Text>
        <Paragraph
          style={{
            marginTop: '8px',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '20px',
          }}>
          {descriptionTruncated}
        </Paragraph>
      </>
    );
  })();

  return (
    <Anchor href={props.url} target="_blank">
      <Box
        direction="row"
        align="start"
        pad={{ horizontal: '12px', vertical: '8px' }}
        style={{ borderRadius: '12px', border: '1px solid #D1D5DB' }}>
        <Box>{content}</Box>
      </Box>
    </Anchor>
  );
};

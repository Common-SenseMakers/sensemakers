import { Box, Paragraph, Text } from 'grommet';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

export const RefCard = (props: {
  title?: string;
  description?: string;
  image?: string;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const descriptionTruncated =
    props.description && truncate(props.description, 90);

  return (
    <Box
      direction="row"
      align="start"
      pad={{ horizontal: '12px', vertical: '8px' }}
      style={{ borderRadius: '12px', border: '1px solid #D1D5DB' }}>
      <Box>
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
      </Box>
    </Box>
  );
};

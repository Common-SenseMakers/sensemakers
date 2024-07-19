import { Anchor, Box, Paragraph, Text } from 'grommet';

import { AppHeading, AppLabel } from '../../../ui-components';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

function getTweetId(url: string): string | undefined {
  const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : undefined;
}

export const RefCard = (props: {
  ix: number;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  onClick?: () => void;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const tweetId = getTweetId(props.url);

  const content = (() => {
    if (!titleTruncated && !props.description) {
      const urlTruncated = truncate(props.url, 50);
      return (
        <Anchor href={props.url} target="_blank">
          {urlTruncated}
        </Anchor>
      );
    }

    return (
      <Box
        align="start"
        pad={{ horizontal: '12px', vertical: '8px' }}
        style={{
          borderRadius: '12px',
          border: '1px solid #D1D5DB',
          width: '100%',
        }}>
        <Box
          margin={{ bottom: '4px' }}
          width="100%"
          direction="row"
          justify="between">
          <AppLabel
            colors={{
              font: '#6B7280',
              background: '#E5E7EB',
              border: 'transparent',
            }}
            style={{ borderRadius: '4px', border: 'none' }}>
            Reference {props.ix}
          </AppLabel>
          {tweetId ? (
            <AppLabel
              colors={{
                font: '#6B7280',
                background: 'transparent',
                border: 'transparent',
              }}
              style={{ borderRadius: '4px', border: 'none' }}>
              Quoted Tweet
            </AppLabel>
          ) : (
            <></>
          )}
        </Box>

        <AppHeading level={4} color="#374151" style={{ fontWeight: '500' }}>
          {titleTruncated}
        </AppHeading>

        <Paragraph
          margin={{ vertical: '4px' }}
          size="medium"
          style={{ lineHeight: '18px', color: '#6B7280' }}
          maxLines={2}>
          {props.description}
        </Paragraph>

        <Box style={{ overflow: 'hidden' }}>
          <Text
            style={{ fontSize: '16px', color: '#337FBD', fontWeight: '400' }}>
            {props.url}
          </Text>
        </Box>
      </Box>
    );
  })();

  return (
    <Anchor
      href={props.url}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        fontWeight: 'normal',
        width: '100%',
      }}
      target="_blank">
      {content}
    </Anchor>
  );
};

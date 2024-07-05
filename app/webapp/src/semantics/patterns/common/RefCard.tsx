import { Anchor, Box, Image, Paragraph, Text } from 'grommet';
import { Tweet } from 'react-tweet';

import { AppHeading, AppLabel } from '../../../ui-components';
import { AppTweet } from './AppTweet';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

function getTweetId(url: string): string | undefined {
  const regex = /twitter\.com\/(?:#!\/)?\w+\/status\/(\d+)/;
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

  if (tweetId) {
    // return <blockquote className="twitter-tweet">{props.url}</blockquote>;
    return <AppTweet id={tweetId}></AppTweet>;
  }
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
        style={{ borderRadius: '12px', border: '1px solid #D1D5DB' }}>
        <Box margin={{ bottom: '4px' }}>
          <AppLabel
            colors={{
              font: '#6B7280',
              background: '#E5E7EB',
              border: 'transparent',
            }}
            style={{ borderRadius: '4px', border: 'none' }}>
            Reference {props.ix}
          </AppLabel>
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

        <Box>
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
      }}
      target="_blank">
      {content}
    </Anchor>
  );
};

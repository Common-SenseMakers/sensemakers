import { Anchor, Box, Image, Paragraph, Text } from 'grommet';
import { Tweet } from 'react-tweet';

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

    const tweetId = getTweetId(props.url);

    if (tweetId) {
      // return <blockquote className="twitter-tweet">{props.url}</blockquote>;
      return <AppTweet id={tweetId}></AppTweet>;
    }

    return (
      <Box
        direction="row"
        align="start"
        pad={{ horizontal: '12px', vertical: '8px' }}
        style={{ borderRadius: '12px', border: '1px solid #D1D5DB' }}>
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
    );
  })();

  return (
    <Anchor href={props.url} target="_blank">
      {content}
    </Anchor>
  );
};

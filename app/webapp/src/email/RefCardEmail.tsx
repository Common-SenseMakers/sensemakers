import { Button, Row, Section, Text } from '@react-email/components';
import { Header } from 'grommet';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

function getTweetId(url: string): string | undefined {
  const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : undefined;
}

export const RefCardEmail = (props: {
  ix: number;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  itemType?: string;
  onClick?: () => void;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const descriptionTruncated =
    props.description && truncate(props.description, 150);
  const tweetId = getTweetId(props.url);

  const content = (() => {
    if (!titleTruncated && !props.description) {
      const urlTruncated = truncate(props.url, 50);
      return (
        <Button href={props.url} target="_blank">
          {urlTruncated}
        </Button>
      );
    }

    return (
      <Section
        style={{
          borderRadius: '12px',
          border: '1px solid #D1D5DB',
          width: '100%',
          padding: '6px 12px',
          //   display: 'flex',
          //   flexDirection: 'column',
          //   gap: '4px',
        }}>
        <Row>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text
              style={{
                ...cardItemStyle,
                borderRadius: '4px',
                border: 'none',
                color: '#6B7280',
                backgroundColor: '#E5E7EB',
                padding: '0px 4px',
              }}>
              Reference {props.ix + 1}
            </Text>
            {props.itemType && (
              <Text
                style={{
                  ...cardItemStyle,
                  borderRadius: '4px',
                  border: 'none',
                  color: '#6B7280',
                }}>
                {props.itemType + (tweetId ? ' from Quoted Tweet' : '')}
              </Text>
            )}
          </div>
        </Row>
        <Row>
          <Header color="#374151" style={{ fontWeight: '500' }}>
            {titleTruncated}
          </Header>
        </Row>
        <Text
          style={{ ...cardItemStyle, lineHeight: '18px', color: '#6B7280' }}>
          {descriptionTruncated}
        </Text>

        <Section style={{ overflow: 'hidden' }}>
          <Text
            style={{
              ...cardItemStyle,
              color: '#337FBD',
              fontWeight: '400',
            }}>
            {props.url}
          </Text>
        </Section>
      </Section>
    );
  })();

  return (
    <Button
      href={props.url}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        fontWeight: 'normal',
        width: '100%',
      }}
      target="_blank">
      {content}
    </Button>
  );
};
function capitalizeWords(sentence: string) {
  return sentence
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const cardItemStyle = {
  margin: '4px 0px',
};

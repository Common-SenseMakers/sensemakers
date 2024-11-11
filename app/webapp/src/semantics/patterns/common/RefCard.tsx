import { Anchor, Box, Paragraph, Text } from 'grommet';

import { AppHeading } from '../../../ui-components';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { zoteroItemTypeDisplay } from '../../../utils/post.utils';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

export const RefCard = (props: {
  url: string;
  ix?: number;
  title?: string;
  description?: string;
  image?: string;
  onClick?: () => void;
  refType?: string;
  sourceRef?: number;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const { constants } = useThemeContext();

  const urlTruncated = truncate(props.url, 50);

  const onCardClicked = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const target = event.target as HTMLElement;

    if (target.id === 'url-anchor') {
      window.open(props.url, '_blank', 'noopener,noreferrer');
      return;
    }

    props.onClick && props.onClick();
  };

  return (
    <Box align="start" pad={{}} onClick={(e) => onCardClicked(e)}>
      <Box
        margin={{ bottom: '20px' }}
        width="100%"
        direction="row"
        justify="start">
        {props.refType && (
          <Text
            style={{
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '16px',
              color: constants.colors.textLight2,
            }}>
            {props.sourceRef
              ? `${zoteroItemTypeDisplay(props.refType)} from Reference ${props.sourceRef}`
              : zoteroItemTypeDisplay(props.refType)}
          </Text>
        )}
      </Box>

      <AppHeading level={4} color="#374151" style={{ fontWeight: '500' }}>
        {titleTruncated}
      </AppHeading>

      <Paragraph
        margin={{ vertical: '4px' }}
        size="medium"
        style={{ lineHeight: '18px', color: constants.colors.textLight2 }}
        maxLines={2}>
        {props.description}
      </Paragraph>

      <Box style={{ overflow: 'hidden' }}>
        <Anchor
          id="url-anchor"
          style={{
            fontSize: '16px',
            color: '#337FBD',
            fontWeight: '400',
            lineBreak: 'anywhere',
            textDecoration: 'none',
          }}
          target="_blank">
          {urlTruncated}
        </Anchor>
      </Box>
    </Box>
  );
};

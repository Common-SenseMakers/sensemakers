import { Anchor, Box, Paragraph, Text } from 'grommet';

import { AppHeading, AppLabel } from '../../../ui-components';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { zoteroItemTypeDisplay } from '../../../utils/post.utils';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

export const RefCard = (props: {
  ix: number;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  onClick?: () => void;
  refType?: string;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const { constants } = useThemeContext();

  const urlTruncated = truncate(props.url, 50);

  const onCardClicked = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    window.open(props.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      align="start"
      pad={{ horizontal: '12px', vertical: '8px' }}
      style={{
        borderRadius: '12px',
        border: '1px solid #D1D5DB',
        width: '100%',
      }}
      onClick={(e) => onCardClicked(e)}>
      <Box
        margin={{ bottom: '4px' }}
        width="100%"
        direction="row"
        justify="between">
        <AppLabel
          colors={{
            font: constants.colors.textLight2,
            background: '#E5E7EB',
            border: 'transparent',
          }}
          style={{ borderRadius: '4px', border: 'none' }}>
          Reference {props.ix}
        </AppLabel>
        {props.refType ? (
          <AppLabel
            colors={{
              font: constants.colors.textLight2,
              background: 'transparent',
              border: 'transparent',
            }}
            style={{ borderRadius: '4px', border: 'none' }}>
            {zoteroItemTypeDisplay(props.refType)}
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
        style={{ lineHeight: '18px', color: constants.colors.textLight2 }}
        maxLines={2}>
        {props.description}
      </Paragraph>

      <Box style={{ overflow: 'hidden' }}>
        <Text style={{ fontSize: '16px', color: '#337FBD', fontWeight: '400' }}>
          {props.url}
        </Text>
      </Box>
    </Box>
  );
};

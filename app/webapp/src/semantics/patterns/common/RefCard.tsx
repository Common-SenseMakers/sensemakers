// import axios from 'axios';
import { Anchor, Box, Paragraph, Text } from 'grommet';
import { useMemo } from 'react';

import { OpenLinkIcon } from '../../../app/icons/OpenLinkIcon';
import { CARD_BORDER } from '../../../post/PostCard';
import { AppHeading } from '../../../ui-components';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { zoteroItemTypeDisplay } from '../../../utils/post.utils';

export const REF_URL_ANCHOR_ID = 'ref-url-anchor';

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

export const RefCard = (props: {
  url: string;
  ix?: number;
  title?: string;
  description?: string;
  image?: string;
  refType?: string;
  sourceRef?: number;
  showDescription?: boolean;
  showAllMentionsText?: boolean;
}) => {
  const titleTruncated = useMemo(
    () => props.title && truncate(props.title, 50),
    [props.title]
  );

  const { constants } = useThemeContext();

  const domain = useMemo(() => extractDomain(props.url), [props.url]);

  return (
    <Box width="100%" align="start" pad={{}}>
      <Box width="100%" justify="between" direction="row">
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
        {props.showAllMentionsText && (
          <span
            style={{
              color: '#4B5563',
              fontFamily: 'Libre Franklin',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '16px',
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid',
              textDecorationSkipInk: 'none',
              textDecorationThickness: 'auto',
              textUnderlineOffset: 'auto',
              textUnderlinePosition: 'from-font',
              width: '100%',
              textAlign: 'right',
            }}>
            Show All Mentions
          </span>
        )}
      </Box>
      <Box
        style={{
          display: 'flex',
          alignItems: props.showDescription ? 'flex-start' : 'center',
          gap: '12px',
          alignSelf: 'stretch',
          flexDirection: 'row',
        }}>
        {props.image && (
          <Box
            style={{
              borderRadius: '8px',
              border: CARD_BORDER,
              background: props.image
                ? `url(${props.image}) lightgray 50% / cover no-repeat`
                : undefined,
              width: '76px',
              height: '76px',
              flexShrink: 0,
            }}></Box>
        )}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            flex: '1 0 0',
            overflow: 'hidden',
          }}>
          <AppHeading
            level={4}
            color="#111827"
            style={{ fontWeight: '500', fontSize: '18px' }}>
            {titleTruncated}
          </AppHeading>
          {props.showDescription && props.description && (
            <Paragraph
              margin={{ vertical: '4px' }}
              size="medium"
              style={{
                lineHeight: '18px',
                color: '#111827',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
              }}
              maxLines={3}>
              {props.description}
            </Paragraph>
          )}
          <Box
            onClick={() =>
              window.open(props.url, '_blank', 'noopener,noreferrer')
            }
            direction="row"
            gap="4px"
            style={{
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Anchor
              id={REF_URL_ANCHOR_ID}
              style={{
                fontSize: '16px',
                color: '#337FBD',
                fontWeight: '500',
                lineBreak: 'anywhere',
                textDecoration: 'none',
              }}
              target="_blank">
              {domain}
            </Anchor>
            <OpenLinkIcon size={16} color="#337FBD" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

import axios from 'axios';
import { Anchor, Box, Paragraph, Text } from 'grommet';
import { useEffect, useState } from 'react';

import { IFRAMELY_API_KEY, IFRAMELY_API_URL } from '../../../app/config';
import { OpenLinkIcon } from '../../../app/icons/OpenLinkIcon';
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
  onClick?: () => void;
  refType?: string;
  sourceRef?: number;
}) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const { constants } = useThemeContext();

  const domain = extractDomain(props.url);

  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const thumbnailUrl = await getThumbnail(props.url);
        setThumbnail(thumbnailUrl);
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
      }
    };

    fetchThumbnail().catch((error) =>
      console.error('Error in fetchThumbnail:', error)
    );
  }, [props.url]);

  return (
    <Box align="start" pad={{}}>
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
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          alignSelf: 'stretch',
          flexDirection: 'row',
        }}>
        {thumbnail && (
          <Box
            style={{
              borderRadius: '8px',
              border: '1px solid var(--Neutral-300, #D1D5DB)',
              background: thumbnail
                ? `url(${thumbnail}) lightgray 50% / cover no-repeat`
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
          }}>
          <AppHeading
            level={4}
            color="#374151"
            style={{ fontWeight: '500', fontSize: '18px' }}>
            {titleTruncated}
          </AppHeading>
          {props.description && (
            <Paragraph
              margin={{ vertical: '4px' }}
              size="medium"
              style={{ lineHeight: '18px', color: constants.colors.textLight2 }}
              maxLines={2}>
              {props.description}
            </Paragraph>
          )}
          <Box
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

async function getThumbnail(url: string): Promise<string | undefined> {
  if (!IFRAMELY_API_KEY || !IFRAMELY_API_URL) {
    console.error('Iframely API key not found.');
    return undefined;
  }
  const apiKey = IFRAMELY_API_KEY;
  const apiUrl = `${IFRAMELY_API_URL}/iframely?url=${encodeURIComponent(url)}&api_key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const data: IframelyResponse = response.data as IframelyResponse;

    // Check if 'links' and 'thumbnail' are present in the response
    if (data.links && data.links.thumbnail && data.links.thumbnail.length > 0) {
      // Extract the first thumbnail URL
      const thumbnailUrl = data.links.thumbnail[0].href;
      return thumbnailUrl;
    } else {
      console.error('No thumbnail found for the provided URL.');
      return undefined;
    }
  } catch (error) {
    console.error('Error fetching data from Iframely API:', error);
    return undefined;
  }
}
interface IframelyResponse {
  links: {
    thumbnail: {
      href: string;
    }[];
  };
}

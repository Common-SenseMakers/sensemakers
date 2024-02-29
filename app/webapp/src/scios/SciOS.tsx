import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Text } from 'grommet';
import { useMemo } from 'react';

import { useAccountContext } from '../app/AccountContext';
import { getSparql } from '../functionsCalls/post.requests';
import { AppHeading, AppLabel } from '../ui-components';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { URLS_QUERY } from './queries';

type Urls = Map<
  string,
  {
    authors: Array<{ author: string; keywords: string[] }>;
  }
>;

export const AppSciOS = (props: {}) => {
  const { constants } = useThemeContext();
  const { appAccessToken } = useAccountContext();

  const { data: urlsResult } = useQuery({
    queryKey: ['sparql-urls', appAccessToken],
    queryFn: async () => {
      if (appAccessToken) {
        return getSparql(URLS_QUERY, appAccessToken);
      }
      return null;
    },
  });

  const topUrls = useMemo<Urls | undefined>(() => {
    const map: Urls = new Map();
    console.log({ urlsResult });

    map.set('https://google.com', {
      authors: [
        {
          author: 'pepo',
          keywords: ['one', 'two'],
        },
      ],
    });

    map.set('https://altavista.com', {
      authors: [
        {
          author: 'shahar',
          keywords: ['one', 'two'],
        },
      ],
    });
    return map;
  }, [urlsResult]);

  return (
    <Box pad={{ vertical: 'large' }} align="start" gap="medium">
      <AppHeading level="1">SciOS 2024 - Demo</AppHeading>
      {topUrls ? (
        Array.from(topUrls.entries()).map(([url, data]) => {
          return (
            <Box
              gap="small"
              pad={{ left: 'medium' }}
              style={{
                borderLeft: '4px solid',
                borderColor: constants.colors.backgroundLightDarker,
              }}>
              <Anchor href={url}>{url}</Anchor>
              {data.authors.map((authorData) => {
                return (
                  <Box direction="row" align="center" gap="medium">
                    <Text>{authorData.author}</Text>
                    <Box direction="row" gap="small">
                      {authorData.keywords.map((keyword) => {
                        return <AppLabel>#{keyword}</AppLabel>;
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          );
        })
      ) : (
        <Box>
          <Loading></Loading>
        </Box>
      )}
    </Box>
  );
};

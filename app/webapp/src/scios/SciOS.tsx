import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Text } from 'grommet';
import { useMemo } from 'react';

import { useAccountContext } from '../app/AccountContext';
import { getSparql } from '../functionsCalls/post.requests';
import { AppHeading, AppLabel } from '../ui-components';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { TOP_URLS_QUERY, URLS_DATA_QUERIES } from './queries';

interface UrlAuthorData {
  author: string;
  keywords: Set<string>;
}
type UrlsAuthorData = Map<string, UrlAuthorData>;

type Urls = Map<
  string,
  {
    score: number;
    authorsData?: UrlAuthorData;
  }
>;

type TopUrlsResult = Array<{
  uniqueRef: { value: string };
  url: { value: string };
}>;

type UrlsDataResult = Array<{
  keyword: { value: string };
  name: { value: string };
  post: { value: string };
  relation: { value: string };
  url: { value: string };
}>;

export const AppSciOS = (props: {}) => {
  const { constants } = useThemeContext();
  const { appAccessToken } = useAccountContext();

  const { data: topUrlsResult } = useQuery<TopUrlsResult>({
    queryKey: ['sparql-top-urls', appAccessToken],
    queryFn: async () => {
      if (appAccessToken) {
        return getSparql(TOP_URLS_QUERY, appAccessToken);
      }
      return null;
    },
  });

  const { data: urlsDataResult } = useQuery<UrlsDataResult>({
    queryKey: ['sparql-urls-data', appAccessToken],
    queryFn: async () => {
      if (appAccessToken) {
        return getSparql(URLS_DATA_QUERIES, appAccessToken);
      }
      return null;
    },
  });

  // For each url, store the authors and the keywords of each author
  const urlsAuthorData = useMemo<UrlsAuthorData | undefined>(() => {
    const map: UrlsAuthorData = new Map();

    if (urlsDataResult) {
      urlsDataResult.forEach((urlData) => {
        const url = urlData.url.value;
        const val = map.get(url) || {
          author: urlData.name.value,
          keywords: new Set(),
        };
        val.keywords.add(urlData.keyword.value);
        map.set(url, val);
      });
      return map;
    }
  }, [urlsDataResult]);

  const topUrls = useMemo<Urls | undefined>(() => {
    const map: Urls = new Map();

    if (topUrlsResult && urlsAuthorData) {
      console.log({ topUrlsResult, urlsAuthorData });

      topUrlsResult.forEach((urlRes) => {
        // get data of each url
        const authorsData = urlsAuthorData.get(urlRes.url.value);

        map.set(urlRes.url.value, {
          score: Number(urlRes.uniqueRef),
          authorsData: authorsData,
        });
      });
    }

    return map;
  }, [topUrlsResult, urlsAuthorData]);

  const topUrlsArray = useMemo(() => {
    if (topUrls) {
      const unordered = Array.from(topUrls.entries());
      const ordered = unordered.sort((a, b) =>
        a[1].score > b[1].score ? 1 : -1
      );
      return ordered;
    }
  }, [topUrls]);

  return (
    <Box pad={{ vertical: 'large' }} align="start" gap="medium">
      <AppHeading level="1">SciOS 2024 - Demo</AppHeading>
      {topUrlsArray ? (
        topUrlsArray.map(([url, data]) => {
          return (
            <Box
              gap="small"
              pad={{ left: 'medium' }}
              style={{
                borderLeft: '4px solid',
                borderColor: constants.colors.backgroundLightDarker,
              }}>
              <Text>Score: {data.score}</Text>
              <Anchor href={url}>{url}</Anchor>
              {data.authorsData ? (
                <Box direction="row" align="center" gap="medium">
                  <Text>{data.authorsData.author}</Text>
                  <Box direction="row" gap="small">
                    {Array.from(data.authorsData.keywords.values()).map(
                      (keyword) => {
                        return <AppLabel>#{keyword}</AppLabel>;
                      }
                    )}
                  </Box>
                </Box>
              ) : (
                <></>
              )}
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

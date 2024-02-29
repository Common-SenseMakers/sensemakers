import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useMemo } from 'react';

import { useAccountContext } from '../app/AccountContext';
import { ViewportPage } from '../common/Viewport';
import { getSparql } from '../functionsCalls/post.requests';
import { AppButton, AppHeading } from '../ui-components';
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
    authorsData: UrlsAuthorData;
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

  const { data: topUrlsResult, refetch: refetchTop } = useQuery<TopUrlsResult>({
    queryKey: ['sparql-top-urls', appAccessToken],
    queryFn: async () => {
      return getSparql(TOP_URLS_QUERY);
    },
  });

  const { data: urlsDataResult, refetch: refetchUrlsData } =
    useQuery<UrlsDataResult>({
      queryKey: ['sparql-urls-data', appAccessToken],
      queryFn: async () => {
        return getSparql(URLS_DATA_QUERIES);
      },
    });

  const refresh = () => {
    refetchTop();
    refetchUrlsData();
  };

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
        map.set(urlRes.url.value, {
          score: Number(urlRes.uniqueRef.value),
          authorsData: urlsAuthorData,
        });
      });
    }

    return map;
  }, [topUrlsResult, urlsAuthorData]);

  const topUrlsArray = useMemo(() => {
    if (topUrls) {
      const unordered = Array.from(topUrls.entries());
      const ordered = unordered.sort((a, b) =>
        a[1].score < b[1].score ? 1 : -1
      );
      return ordered;
    }
  }, [topUrls]);

  console.log({ topUrlsArray });

  const content = (
    <Box pad={{ vertical: 'large' }} align="start" gap="medium">
      <Box direction="row">
        <AppHeading level="1">SciOS 2024 - Demo</AppHeading>
        <AppButton
          onClick={() => {
            refresh();
          }}
          icon={<Refresh></Refresh>}></AppButton>
      </Box>

      <Box gap="large">
        {topUrlsArray ? (
          topUrlsArray.map(([url, topUrlData], ix) => {
            return (
              <Box
                key={ix}
                gap="small"
                pad={{ left: 'medium' }}
                style={{
                  borderLeft: '4px solid',
                  borderColor: constants.colors.backgroundLightDarker,
                }}>
                <Box direction="row" gap="small" align="center">
                  <Box
                    pad="xsmall"
                    style={{
                      width: '60px',
                      textAlign: 'center',
                      backgroundColor: constants.colors.primary,
                      borderRadius: '4px',
                    }}>
                    <Text
                      size="large"
                      color={constants.colors.textOnPrimary}
                      style={{ fontWeight: 'bold' }}>
                      {topUrlData.score}
                    </Text>
                  </Box>
                  <Anchor href={url}>{url}</Anchor>
                </Box>
                {topUrlData.authorsData ? (
                  <Box direction="row" align="center" gap="medium">
                    {Array.from(topUrlData.authorsData.entries()).map(
                      ([url, authorData]) => {
                        return <Text>{authorData.author}</Text>;
                      }
                    )}
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
    </Box>
  );

  return <ViewportPage content={content} nav={<></>}></ViewportPage>;
};

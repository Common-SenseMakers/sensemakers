import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Grid, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useMemo } from 'react';

import { useAccountContext } from '../app/AccountContext';
import { ViewportPage } from '../common/Viewport';
import { getSparql } from '../functionsCalls/post.requests';
import { AppButton, AppHeading, AppLabel } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { TOP_URLS_QUERY, URLS_DATA_QUERIES } from './queries';

interface UrlPerAuthorData {
  labels: Set<string>;
}
type author = string;
type UrlAuthorData = Map<author, UrlPerAuthorData>;

interface UrlData {
  score: number;
  authorsData?: UrlAuthorData;
}

type Urls = Map<string, UrlData>;

type TopUrlsResult = Array<{
  uniqueRef: { value: string };
  url: { value: string };
}>;

type UrlsDataResult = Array<{
  url: { value: string };
  name: { value: string };
  relation: { value: string };
}>;

export const AppSciOS = (props: {}) => {
  const { constants } = useThemeContext();
  const { appAccessToken } = useAccountContext();

  const {
    data: topUrlsResult,
    refetch: refetchTop,
    isFetching: isFetchingTop,
  } = useQuery<TopUrlsResult>({
    queryKey: ['sparql-top-urls', appAccessToken],
    queryFn: async () => {
      return getSparql(TOP_URLS_QUERY);
    },
  });

  const {
    data: urlsDataResult,
    refetch: refetchUrlsData,
    isFetching: isFetchingUrlData,
  } = useQuery<UrlsDataResult>({
    queryKey: ['sparql-urls-data', appAccessToken],
    queryFn: async () => {
      return getSparql(URLS_DATA_QUERIES);
    },
  });

  const isLoading = isFetchingTop || isFetchingUrlData;

  const refresh = () => {
    refetchTop();
    refetchUrlsData();
  };

  // For each urlDataResult, store the authors and the labels of each author
  const urlsWithAuthorData = useMemo<Urls | undefined>(() => {
    const map: Urls = new Map();

    if (urlsDataResult) {
      urlsDataResult.forEach((urlData) => {
        const url = urlData.url.value;
        const val: UrlData = map.get(url) || {
          score: 0,
          authorsData: new Map(),
        };

        if (!val.authorsData) {
          console.error(`unexpected authorsData`);
          return map;
        }

        const currentLabels = val.authorsData.get(urlData.name.value);
        const newData = currentLabels || {
          labels: new Set(),
        };

        newData.labels.add(urlData.relation.value);

        val.authorsData.set(urlData.name.value, newData);
        map.set(url, val);
      });
      return map;
    }
  }, [urlsDataResult]);

  const topUrls = useMemo<Urls | undefined>(() => {
    const map: Urls = new Map();

    if (topUrlsResult && urlsWithAuthorData) {
      // for each top result, copy the authorsData
      topUrlsResult.forEach((urlRes) => {
        const url = urlRes.url.value;
        const urlAuthorData = urlsWithAuthorData.get(url);

        map.set(urlRes.url.value, {
          score: Number(urlRes.uniqueRef.value),
          authorsData: urlAuthorData?.authorsData,
        });
      });
    }

    return map;
  }, [topUrlsResult, urlsWithAuthorData]);

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
                  <Anchor target="_blank" href={url}>
                    {url}
                  </Anchor>
                </Box>
                {topUrlData.authorsData ? (
                  <Grid columns={{ count: 3, size: 'auto' }} gap="medium">
                    {Array.from(topUrlData.authorsData.entries()).map(
                      ([author, authorData]) => {
                        return (
                          <Box style={{ width: '180px' }} align="center">
                            <Text textAlign="center">{author}</Text>
                            {authorData ? (
                              Array.from(authorData.labels).map((label, ix) => {
                                const labelShort = (() => {
                                  const parts = label.split('/'); // Split the string into an array of parts
                                  return parts[parts.length - 1]; // Return the last part
                                })();
                                return (
                                  <Box
                                    key={ix}
                                    style={{
                                      display: 'block',
                                      float: 'left',
                                      paddingTop: '5.5px',
                                    }}>
                                    <AppLabel
                                      key={ix}
                                      margin={{
                                        right: 'xmall',
                                        bottom: 'xsmall',
                                      }}>
                                      {`#${labelShort}`}
                                    </AppLabel>
                                  </Box>
                                );
                              })
                            ) : (
                              <></>
                            )}
                          </Box>
                        );
                      }
                    )}
                  </Grid>
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

  return (
    <ViewportPage
      justify="start"
      content={
        <>
          <Box direction="row">
            <AppHeading level="1">SciOS 2024 - Demo</AppHeading>
            <AppButton
              onClick={() => {
                refresh();
              }}
              icon={<Refresh></Refresh>}></AppButton>
          </Box>
          {!isLoading ? (
            content
          ) : (
            <BoxCentered fill>
              <Loading></Loading>
            </BoxCentered>
          )}
        </>
      }
      nav={<></>}></ViewportPage>
  );
};

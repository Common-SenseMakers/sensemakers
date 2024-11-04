import { Box, BoxExtendedProps, Text } from 'grommet';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ModalContent } from '../app/AppModalStandard';
import { useToastContext } from '../app/ToastsContext';
import { FilterIcon } from '../app/icons/FilterIcon';
import { HmmIcon } from '../app/icons/HmmIcon';
import { ReloadIcon } from '../app/icons/ReloadIcon';
import { useViewport } from '../app/layout/Viewport';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostCard } from '../post/PostCard';
import { PostCardLoading } from '../post/PostCardLoading';
import { PostContext } from '../post/post.context/PostContext';
import { PostsQueryStatus } from '../shared/types/types.posts';
import { AppButton, AppHeading, AppSelect } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PostFetcherInterface } from './posts.fetcher.hook';

const DEBUG = false;

export interface FilterOption {
  value: string;
  pretty: string;
}

/**
 * Receives a PostFetcherInterface object (with the posts array and methods
 * to interact with it) and renders it as a feed of PostCard.
 * It includes the infinite scrolling
 */
export const PostsFetcherComponent = (props: {
  feed: PostFetcherInterface;
  pageTitle: string;
  filterOptions: FilterOption[];
  status?: PostsQueryStatus;
  onFilterOptionChanged: (filter: PostsQueryStatus) => void;
  isPublicFeed?: boolean;
  showHeader?: boolean;
}) => {
  const { show } = useToastContext();
  const { constants } = useThemeContext();
  const { t } = useTranslation();

  const {
    pageTitle,
    status: filterStatus,
    filterOptions,
    onFilterOptionChanged,
    feed,
    isPublicFeed: _isPublicFeed,
    showHeader: _showHeader,
  } = props;

  const isPublicFeed = _isPublicFeed !== undefined ? _isPublicFeed : false;
  const showHeader = _showHeader !== undefined ? _showHeader : true;

  const navigate = useNavigate();

  const {
    posts,
    fetchOlder,
    errorFetchingOlder,
    isFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    moreToFetch,
  } = feed;

  const { isAtBottom } = useViewport();

  useEffect(() => {
    if (isAtBottom && !isLoading && moreToFetch) {
      if (DEBUG)
        console.log(`${feed.feedNameDebug}fetchingOlder due to isAtBottom`, {
          isAtBottom,
          isLoading,
          moreToFetch,
        });
      console.warn('skipping infinte scroll');

      // fetchOlder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOlder, isAtBottom, isLoading, moreToFetch]);

  useEffect(() => {
    const error = errorFetchingOlder || errorFetchingNewer;
    if (error) {
      const message = (() => {
        const regexCode = /code:\s*(\d+)/;
        const regexRetry = /retryAfter:\s*(\d+)/;
        const code = error.message.match(regexCode);
        const retry = error.message.match(regexRetry);

        if (code && retry !== null) {
          const retrySeconds = parseInt(retry[1]);

          if (code && retry) {
            return `Too many requests to Twitter's API. Please retry in ${retrySeconds > 60 ? `${Math.ceil(retrySeconds / 60)} minutes` : `${retrySeconds} seconds`}`;
          }
        }

        return error.message;
      })();

      show({
        title: 'Error getting users posts',
        message,
      });
    }
  }, [errorFetchingOlder, errorFetchingNewer, show]);

  const content = useMemo(() => {
    if (DEBUG) {
      console.log('PostsFetcherComponent - content', {
        posts,
        isLoading,
        isPublicFeed,
        isFetchingOlder,
        moreToFetch,
      });
    }
    if (!posts || isLoading) {
      return [1, 2, 4, 5, 6, 7, 8].map((ix) => (
        <PostCardLoading key={ix}></PostCardLoading>
      ));
    }

    if (posts.length === 0) {
      return (
        <BoxCentered style={{ height: '100%' }}>
          <ModalContent
            type="small"
            title={t(AppGeneralKeys.noPostsFound)}
            icon={
              <BoxCentered
                style={{
                  height: '60px',
                  width: '60px',
                  borderRadius: '40px',
                  backgroundColor: '#CEE2F2',
                }}
                margin={{ bottom: '16px' }}>
                <HmmIcon size={40}></HmmIcon>
              </BoxCentered>
            }
            parragraphs={[
              <>{t(AppGeneralKeys.noPostsFoundDesc)}</>,
            ]}></ModalContent>
        </BoxCentered>
      );
    }

    return (
      <>
        <Box>
          {posts.map((post, ix) => (
            <Box key={ix} id={`post-${post.id}`}>
              <PostContext postInit={post}>
                <PostCard
                  isPublicFeed={isPublicFeed}
                  handleClick={() => {
                    const path = `/post/${post.id}`;
                    navigate(path);
                  }}></PostCard>
              </PostContext>
            </Box>
          ))}
        </Box>
        {isFetchingOlder && (
          <Box>
            <LoadingDiv height="120px" width="100%"></LoadingDiv>
          </Box>
        )}
        {moreToFetch && !isFetchingOlder && (
          <Box
            margin={{ vertical: 'medium', horizontal: 'medium' }}
            align="center"
            justify="center">
            <Text
              style={{
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '16px',
                color: 'grey',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() => fetchOlder()}>
              {t(AppGeneralKeys.loadMorePosts)}
            </Text>
          </Box>
        )}
        {!moreToFetch && (
          <Box
            margin={{ vertical: 'medium', horizontal: 'medium' }}
            align="center"
            justify="center">
            <Text
              style={{
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '16px',
                color: 'grey',
              }}>
              {t(AppGeneralKeys.noMorePosts)}
            </Text>
          </Box>
        )}
      </>
    );
  }, [
    posts,
    isLoading,
    isFetchingOlder,
    moreToFetch,
    t,
    isPublicFeed,
    navigate,
    fetchOlder,
  ]);

  const FilterValue = (
    props: {
      status?: string;
      border?: boolean;
      padx?: boolean;
    } & BoxExtendedProps
  ) => {
    const pretty = filterOptions.find(
      (opt) => opt.value === props.status
    )?.pretty;
    return (
      <Box pad={{ horizontal: 'small', vertical: 'small' }} width="100%">
        <Text size="small">{pretty}</Text>
      </Box>
    );
  };

  const options = filterOptions.map((opt) => opt.value);

  const menu = (
    <AppSelect
      value={
        <Box direction="row" align="center">
          <FilterValue border status={filterStatus}></FilterValue>
          <FilterIcon></FilterIcon>
        </Box>
      }
      options={options}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterOptionChanged(e.target.value as PostsQueryStatus);
      }}>
      {(status: string) => {
        return <FilterValue padx status={status}></FilterValue>;
      }}
    </AppSelect>
  );

  const reload = isFetchingNewer ? (
    <Box>
      <Loading color={constants.colors.primary} size="20px"></Loading>
    </Box>
  ) : (
    <AppButton
      plain
      icon={<ReloadIcon size={20}></ReloadIcon>}
      onClick={() => fetchNewer()}></AppButton>
  );

  const header = (
    <Box
      pad={{ horizontal: 'medium', vertical: 'none' }}
      style={{
        backgroundColor: constants.colors.shade,
        flexShrink: 0,
        minHeight: '40px',
      }}>
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" gap="12px">
          <AppHeading level="3">{pageTitle}</AppHeading>
          <BoxCentered style={{ height: '40px' }}>{reload}</BoxCentered>
        </Box>
        <Box>{true || menu}</Box>
      </Box>
    </Box>
  );

  return (
    <>
      {showHeader && header}
      <Box fill justify="start">
        {content}
      </Box>
    </>
  );
};

import { Anchor, Box, BoxExtendedProps, DropButton, Menu, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import debounce from 'lodash.debounce';
import { CSSProperties, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useServiceWorker } from '../app/ServiceWorkerContext';
import { useToastContext } from '../app/ToastsContext';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { PostsQueryStatus, UserPostsQuery } from '../shared/types/types.posts';
import { AppButton, AppHeading, AppSelect } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ConnectedUser } from '../user-login/ConnectedUser';
import { useUserPosts } from './UserPostsContext';

const statusPretty: Record<PostsQueryStatus, string> = {
  all: 'All',
  ignored: 'Ignored',
  pending: 'Pending',
  published: 'Published',
};

export const UserHome = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const { show } = useToastContext();

  const { hasUpdate, needsInstall, updateApp, install } = useServiceWorker();

  const {
    filterStatus,
    posts,
    fetchOlder,
    errorFetchingOlder,
    isFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
  } = useUserPosts();

  const hasReachedBottom = useRef(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = debounce(() => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 50
    ) {
      if (!isFetchingOlder && !hasReachedBottom.current) {
        console.log('fetching older');
        hasReachedBottom.current = true;
        fetchOlder();
      }
    }
  }, 300);

  /** reset hasReachedBottom after older posts have been fetched */
  useEffect(() => {
    if (!isFetchingOlder) hasReachedBottom.current = false;
  }, [posts?.length]);

  useEffect(() => {
    const error = errorFetchingOlder || errorFetchingNewer;
    if (error) {
      show({
        title: 'Error getting users posts',
        message: error.message.includes('429')
          ? "Too many requests to Twitter's API. Please retry in 10-15 minutes"
          : error.message,
      });
    }
  }, [errorFetchingOlder, errorFetchingNewer]);

  const navigate = useNavigate();

  const setFilter = (filter: UserPostsQuery) => {
    navigate(`/${filter.status}`);
  };

  const content = (() => {
    if (!posts || isLoading) {
      return [1, 2, 4, 5, 6].map((ix) => (
        <LoadingDiv
          key={ix}
          height="108px"
          width="100%"
          margin={{ bottom: '2px' }}></LoadingDiv>
      ));
    }

    if (posts.length === 0) {
      return (
        <BoxCentered>
          <Text>No posts found</Text>
        </BoxCentered>
      );
    }

    return (
      <>
        <Box gap="medium">
          {posts.map((post, ix) => (
            <Box key={ix}>
              <PostCard post={post} shade={ix % 2 === 1}></PostCard>
            </Box>
          ))}
        </Box>
        <Box pad="large">
          {posts.length > 0 &&
          !errorFetchingOlder &&
          filterStatus === PostsQueryStatus.ALL ? (
            <AppButton
              disabled={isFetchingOlder}
              label={!isFetchingOlder ? 'fetch older' : 'loading...'}
              onClick={() => fetchOlder()}></AppButton>
          ) : (
            <> </>
          )}
        </Box>
      </>
    );
  })();

  const FilterValue = (
    props: {
      status: PostsQueryStatus;
      border?: boolean;
    } & BoxExtendedProps
  ) => {
    const borderStyle: CSSProperties = props.border
      ? {
          border: '1px solid',
          borderRadius: '8px',
          borderColor: constants.colors.border,
        }
      : {};
    return (
      <Box
        pad={{ horizontal: 'medium', vertical: 'small' }}
        width="100%"
        style={{
          backgroundColor: 'white',
          ...borderStyle,
          boxShadow:
            '0px 1px 2px 0px rgba(16, 24, 40, 0.04), 0px 1px 2px 0px rgba(16, 24, 40, 0.04)',
        }}>
        <Text size="14px">{statusPretty[props.status]}</Text>
      </Box>
    );
  };

  const options: PostsQueryStatus[] = [
    PostsQueryStatus.ALL,
    PostsQueryStatus.PENDING,
    PostsQueryStatus.PUBLISHED,
    PostsQueryStatus.IGNORED,
  ];

  const menu = (
    <AppSelect
      value={
        filterStatus ? (
          <FilterValue border status={filterStatus}></FilterValue>
        ) : (
          <FilterValue border status={PostsQueryStatus.ALL}></FilterValue>
        )
      }
      options={options}
      onChange={(e) =>
        setFilter({
          status: e.target.value,
          fetchParams: { expectedAmount: 10 },
        })
      }>
      {(status) => {
        return <FilterValue status={status}></FilterValue>;
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
      icon={<Refresh color={constants.colors.primary} size="20px"></Refresh>}
      onClick={() => fetchNewer()}></AppButton>
  );

  const updater = (() => {
    if (hasUpdate) {
      return (
        <Box direction="row" align="center" gap="4px">
          <Text style={{ fontSize: '14px' }}>{t(I18Keys.updateAvailable)}</Text>
          <Anchor onClick={() => updateApp()}>
            <Text style={{ fontSize: '14px' }}>{t(I18Keys.updateNow)}</Text>
          </Anchor>
        </Box>
      );
    }
    return <></>;
  })();

  const installer = (() => {
    if (needsInstall) {
      return (
        <Box direction="row" align="center" gap="4px">
          <Text style={{ fontSize: '14px' }}>{t(I18Keys.installPrompt)}</Text>
          <Anchor onClick={() => install()}>
            <Text style={{ fontSize: '14px' }}>{t(I18Keys.installNow)}</Text>
          </Anchor>
        </Box>
      );
    }
    return <></>;
  })();

  const header = (
    <Box
      pad={{ top: '12px', bottom: '12px', horizontal: '12px' }}
      style={{ backgroundColor: constants.colors.shade, flexShrink: 0 }}>
      {installer}
      {updater}
      <Box
        direction="row"
        margin={{ bottom: '12px' }}
        justify="between"
        align="center">
        <AppHeading level="3">{t(I18Keys.yourPublications)}</AppHeading>
        <ConnectedUser></ConnectedUser>
      </Box>

      <Box direction="row" align="center">
        <Box style={{ flexGrow: 1 }}>{menu}</Box>
        <Box pad={{ horizontal: '10px' }}>{reload}</Box>
      </Box>
    </Box>
  );

  return (
    <>
      {header}

      <Box fill justify="start">
        {content}
      </Box>
    </>
  );
};

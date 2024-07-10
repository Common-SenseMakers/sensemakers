import { Anchor, Box, BoxExtendedProps, Text } from 'grommet';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useServiceWorker } from '../app/ServiceWorkerContext';
import { useToastContext } from '../app/ToastsContext';
import { FilterIcon } from '../app/icons/FilterIcon';
import { ReloadIcon } from '../app/icons/ReloadIcon';
import { ViewportPageScrollContext } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { PostsQueryStatus, UserPostsQuery } from '../shared/types/types.posts';
import { AppButton, AppHeading, AppModal, AppSelect } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { IntroModal } from './IntroModal';
import { useUserPosts } from './UserPostsContext';

const statusPretty: Record<PostsQueryStatus, string> = {
  all: 'All Drafts',
  ignored: 'Ignored',
  pending: 'For Review',
  published: 'Published',
};

const INTRO_SHOWN = 'introShown';

export const UserHome = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const { show } = useToastContext();

  const { hasUpdate, needsInstall, updateApp, install } = useServiceWorker();

  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    const shown = localStorage.getItem(INTRO_SHOWN);
    if (!shown) {
      setShowIntro(true);
    }
  }, []);

  const introClosed = () => {
    setShowIntro(false);
    localStorage.setItem(INTRO_SHOWN, 'true');
  };

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
    moreToFetch,
  } = useUserPosts();

  const { isAtBottom } = useContext(ViewportPageScrollContext);
  const location = useLocation();

  useEffect(() => {
    if (isAtBottom && !isLoading && moreToFetch) {
      fetchOlder();
    }
  }, [isAtBottom]);

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
  }, [errorFetchingOlder, errorFetchingNewer]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (location.state?.postId) {
      const postCard = document.querySelector(`#post-${location.state.postId}`);
      const viewportPage = document.querySelector('#content');
      if (postCard && viewportPage) {
        timeout = setTimeout(() => {
          postCard.scrollIntoView({
            behavior: 'instant' as ScrollBehavior,
            block: 'center',
          });
        }, 0);
      }
    }
    return () => clearTimeout(timeout);
  }, []);

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
        <Box>
          {posts.map((post, ix) => (
            <Box key={ix} id={`post-${post.id}`}>
              <PostCard post={post}></PostCard>
            </Box>
          ))}
        </Box>
        {isFetchingOlder && (
          <Box>
            <LoadingDiv height="120px" width="100%"></LoadingDiv>
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
              {t(I18Keys.noMorePosts)}
            </Text>
          </Box>
        )}
      </>
    );
  })();

  const FilterValue = (
    props: {
      status: PostsQueryStatus;
      border?: boolean;
      padx?: boolean;
    } & BoxExtendedProps
  ) => {
    return (
      <Box pad={{ horizontal: 'small', vertical: 'small' }} width="100%">
        <Text size="small">{statusPretty[props.status]}</Text>
      </Box>
    );
  };

  const options: PostsQueryStatus[] = [
    PostsQueryStatus.ALL,
    PostsQueryStatus.PENDING,
    PostsQueryStatus.IGNORED,
  ];

  const menu = (
    <AppSelect
      value={
        <Box direction="row" align="center">
          <FilterValue border status={filterStatus}></FilterValue>
          <FilterIcon></FilterIcon>
        </Box>
      }
      options={options}
      onChange={(e) =>
        setFilter({
          status: e.target.value,
          fetchParams: { expectedAmount: 10 },
        })
      }>
      {(status) => {
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
      pad={{ horizontal: 'medium', vertical: 'none' }}
      style={{
        backgroundColor: constants.colors.shade,
        flexShrink: 0,
        minHeight: '40px',
      }}>
      {installer}
      {updater}
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" gap="12px">
          <AppHeading level="3">{t(I18Keys.drafts)}</AppHeading>
          <Box>{reload}</Box>
        </Box>
        <Box>{menu}</Box>
      </Box>
    </Box>
  );

  const modal = (() => {
    if (showIntro) {
      return (
        <AppModal onClosed={() => introClosed()}>
          <IntroModal closeModal={() => setShowIntro(false)}></IntroModal>
        </AppModal>
      );
    }
  })();

  return (
    <>
      {header}
      <Box fill justify="start">
        {content}
        {modal}
      </Box>
    </>
  );
};

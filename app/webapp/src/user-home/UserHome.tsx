import { Anchor, Box, BoxExtendedProps, Text } from 'grommet';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ModalContent } from '../app/AppModalStandard';
import { useServiceWorker } from '../app/ServiceWorkerContext';
import { useToastContext } from '../app/ToastsContext';
import { FilterIcon } from '../app/icons/FilterIcon';
import { HmmIcon } from '../app/icons/HmmIcon';
import { ReloadIcon } from '../app/icons/ReloadIcon';
import { locationToPageIx } from '../app/layout/GlobalNav';
import { ViewportPageScrollContext } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { PostCardLoading } from '../post/PostCardLoading';
import { PostContext } from '../post/post.context/PostContext';
import { PostsQueryStatus, UserPostsQuery } from '../shared/types/types.posts';
import { AppButton, AppHeading, AppModal, AppSelect } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { usePersist } from '../utils/use.persist';
import { IntroModals } from './IntroModal';
import { useUserPosts } from './UserPostsContext';

const DEBUG = false;

const statusPretty: Record<PostsQueryStatus, string> = {
  drafts: 'All Drafts',
  ignored: 'Ignored',
  pending: 'For Review',
  published: 'Published',
};

const INTRO_SHOWN = 'introShown';

export const UserHome = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const { show } = useToastContext();

  const { hasUpdate, updateApp } = useServiceWorker();

  const [introShown, setIntroShown] = usePersist<boolean>(INTRO_SHOWN, false);
  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    if (!introShown) {
      setShowIntro(true);
    }
  }, []);

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

  if (DEBUG) {
    console.log('UserHome', {
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
    });
  }

  const { isAtBottom } = useContext(ViewportPageScrollContext);
  const location = useLocation();

  const pageIx = locationToPageIx(location);
  const pageTitle = (() => {
    if (pageIx === 0) {
      return t(I18Keys.drafts);
    }
    if (pageIx === 1) {
      return t(I18Keys.postsNames);
    }
  })();

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

  const closeIntro = () => {
    setIntroShown(true);
    setShowIntro(false);
  };

  const content = (() => {
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
            title={t(I18Keys.noPostsFound)}
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
            parragraphs={[<>{t(I18Keys.noPostsFoundDesc)}</>]}></ModalContent>
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
              {t(I18Keys.loadMorePosts)}
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
    PostsQueryStatus.DRAFTS,
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
      {updater}
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" gap="12px">
          <AppHeading level="3">{pageTitle}</AppHeading>
          <BoxCentered style={{ height: '40px' }}>{reload}</BoxCentered>
        </Box>
        {pageIx === 0 && <Box>{menu}</Box>}
      </Box>
    </Box>
  );

  const modal = (() => {
    if (showIntro) {
      return (
        <AppModal type="small" onModalClosed={() => closeIntro()}>
          <IntroModals closeModal={() => closeIntro()}></IntroModals>
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

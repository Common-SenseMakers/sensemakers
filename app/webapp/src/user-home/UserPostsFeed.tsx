import { Anchor, Box, Text } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useServiceWorker } from '../app/ServiceWorkerContext';
import { locationToPageIx } from '../app/layout/GlobalNav';
import { I18Keys } from '../i18n/i18n';
import {
  FilterOption,
  PostsFetcherComponent,
} from '../posts.fetcher/PostsFetcherComponent';
import { PostsQueryStatus, UserPostsQuery } from '../shared/types/types.posts';
import { AppModal } from '../ui-components';
import { usePersist } from '../utils/use.persist';
import { IntroModals } from './IntroModal';
import { useUserPosts } from './UserPostsContext';

const DEBUG = false;

const options: FilterOption[] = [
  { value: PostsQueryStatus.DRAFTS, pretty: 'All Drafts' },
  { value: PostsQueryStatus.IGNORED, pretty: 'Ignored' },
  { value: PostsQueryStatus.PENDING, pretty: 'For Review' },
  { value: PostsQueryStatus.PUBLISHED, pretty: 'Published' },
];

const INTRO_SHOWN = 'introShown';

export const UserPostsFeed = () => {
  const { t } = useTranslation();

  const { hasUpdate, updateApp } = useServiceWorker();

  const [introShown, setIntroShown] = usePersist<boolean>(INTRO_SHOWN, false);
  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    if (!introShown) {
      setShowIntro(true);
    }
  }, []);

  const { feed, filterStatus } = useUserPosts();

  const location = useLocation();

  const pageIx = locationToPageIx(location);
  const pageTitle = useMemo(() => {
    if (pageIx === 0) {
      return t(I18Keys.drafts);
    }
    if (pageIx === 1) {
      return t(I18Keys.postsNames);
    }
    if (pageIx === 2) {
      return t(I18Keys.feedTitle);
    }
    return '';
  }, [pageIx]);

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
      <Box fill justify="start">
        {updater}
        <PostsFetcherComponent
          feed={feed}
          pageTitle={pageTitle}
          filterOptions={options}
          status={filterStatus}
          onFilterOptionChanged={(value) =>
            setFilter(value)
          }></PostsFetcherComponent>
        {modal}
      </Box>
    </>
  );
};

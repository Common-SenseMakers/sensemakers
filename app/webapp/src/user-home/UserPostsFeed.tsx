import { Anchor, Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useServiceWorker } from '../app/ServiceWorkerContext';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import {
  FilterOption,
  PostsFetcherComponent,
} from '../posts.fetcher/PostsFetcherComponent';
import { PostsQuery, PostsQueryStatus } from '../shared/types/types.posts';
import { usePersist } from '../utils/use.persist';
import { useUserPosts } from './UserPostsContext';

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

  const [introShown] = usePersist<boolean>(INTRO_SHOWN, false);
  const [, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    if (!introShown) {
      setShowIntro(true);
    }
  }, [introShown]);

  const { feed, filterStatus } = useUserPosts();

  const location = useLocation();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const postId = location.state?.postId as string | undefined;
    if (postId) {
      const postCard = document.querySelector(`#post-${postId}`);
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
  }, [location]);

  const navigate = useNavigate();

  const setFilter = (filter: PostsQuery) => {
    navigate(`/${filter.status || ''}`);
  };

  const updater = (() => {
    if (hasUpdate) {
      return (
        <Box direction="row" align="center" gap="4px">
          <Text style={{ fontSize: '14px' }}>
            {t(AppGeneralKeys.updateAvailable)}
          </Text>
          <Anchor onClick={() => updateApp()}>
            <Text style={{ fontSize: '14px' }}>
              {t(AppGeneralKeys.updateNow)}
            </Text>
          </Anchor>
        </Box>
      );
    }
    return <></>;
  })();

  return (
    <>
      <Box fill justify="start">
        {updater}
        <PostsFetcherComponent
          feed={feed}
          pageTitle={t(AppGeneralKeys.myPosts)}
          filterOptions={options}
          status={filterStatus}
          onFilterOptionChanged={(value) =>
            setFilter(value)
          }></PostsFetcherComponent>
      </Box>
    </>
  );
};

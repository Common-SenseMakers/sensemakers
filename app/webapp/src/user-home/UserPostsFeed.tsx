import { Anchor, Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useServiceWorker } from '../app/ServiceWorkerContext';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { usePersist } from '../utils/use.persist';
import { useUserPosts } from './UserPostsContext';

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

  const { feed } = useUserPosts();

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
          pageTitle={t(AppGeneralKeys.myPosts)}></PostsFetcherComponent>
      </Box>
    </>
  );
};

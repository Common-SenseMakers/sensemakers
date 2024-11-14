import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { OverlayContext } from '../posts.fetcher/OverlayContext';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { AppHeading } from '../ui-components';
import { usePersist } from '../utils/use.persist';
import { useUserPosts } from './UserPostsContext';

const INTRO_SHOWN = 'introShown';

export const UserPostsFeed = () => {
  const { t } = useTranslation();

  const [introShown] = usePersist<boolean>(INTRO_SHOWN, false);
  const [, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    if (!introShown) {
      setShowIntro(true);
    }
  }, [introShown]);

  const { feed } = useUserPosts();

  return (
    <OverlayContext>
      <Box fill justify="start">
        <Box pad="medium">
          <AppHeading level={2}>{t(AppGeneralKeys.myPosts)}</AppHeading>
        </Box>
        <PostsFetcherComponent
          feed={feed}
          pageTitle={t(AppGeneralKeys.myPosts)}></PostsFetcherComponent>
      </Box>
    </OverlayContext>
  );
};

import { Box } from 'grommet';
import { useEffect } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { I18Keys } from '../i18n/i18n';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { useFeedPosts } from './PublicFeedContext';

const DEBUG = false;

export const PublicFeed = () => {
  const { t } = useTranslation();
  const { feed } = useFeedPosts();

  const location = useLocation();

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

  return (
    <>
      <Box fill justify="start">
        <PostsFetcherComponent
          feed={feed}
          pageTitle={t(I18Keys.feedTitle)}
          filterOptions={[]}
          onFilterOptionChanged={(value) => {}}></PostsFetcherComponent>
      </Box>
    </>
  );
};

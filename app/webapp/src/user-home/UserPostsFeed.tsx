import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';

import { ClearIcon } from '../app/icons/ClearIcon';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { IntroKeys } from '../i18n/i18n.intro';
import { CARD_BORDER } from '../post/PostCard';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { AppButton } from '../ui-components';
import { usePersist } from '../utils/use.persist';
import { useUserPosts } from './UserPostsContext';

export const HIDE_SHARE_INFO = 'hideShareInfo';

export const UserPostsFeed = () => {
  const { t } = useTranslation();

  const [hideShareInfo, setHideShareInfo] = usePersist<boolean>(
    HIDE_SHARE_INFO,
    false
  );

  const { feed } = useUserPosts();

  return (
    <>
      <Box justify="start">
        {!hideShareInfo && (
          <Box
            direction="row"
            pad="medium"
            gap="28px"
            style={{
              borderBottom: CARD_BORDER,
              backgroundColor: '#DAEDED',
              flexShrink: 0,
            }}>
            <Box style={{ flexGrow: 1 }}>
              <Text
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '16px',
                }}>
                {t(IntroKeys.shareInfo)}
              </Text>
            </Box>
            <AppButton plain onClick={() => setHideShareInfo(true)}>
              <Box style={{ width: '28px', flexShrink: 0 }} justify="center">
                <ClearIcon circle={false} size={20}></ClearIcon>
              </Box>
            </AppButton>
          </Box>
        )}
        <PostsFetcherComponent
          showAggregatedLabels={true}
          boxProps={{}}
          feed={feed}
          pageTitle={t(AppGeneralKeys.myPosts)}></PostsFetcherComponent>
      </Box>
    </>
  );
};

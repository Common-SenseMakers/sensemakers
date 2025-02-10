import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { formatList } from '../i18n/i8n.helper';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { IntroKeys } from '../i18n/i18n.intro';
import { CARD_BORDER } from '../post/PostCard';
import { PostsFetcherComponent } from '../posts.fetcher/PostsFetcherComponent';
import { AppHeading, Banner } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { usePersist } from '../utils/use.persist';
import { useUserPosts } from './UserPostsContext';

export const HIDE_SHARE_INFO = 'hideShareInfo';

export const UserPostsFeed = () => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();
  const { hasDisconnectedAccount, disconnectedAccounts } = useAccountContext();

  const [hideShareInfo, setHideShareInfo] = usePersist<boolean>(
    HIDE_SHARE_INFO,
    false
  );

  const { feed } = useUserPosts();

  return (
    <>
      <Box justify="start">
        <Box pad="medium" style={{ borderBottom: CARD_BORDER, flexShrink: 0 }}>
          <AppHeading level={2}>{t(AppGeneralKeys.myPosts)}</AppHeading>
        </Box>
        {hasDisconnectedAccount && (
          <Banner
            icon={
              <span
                style={{ justifyContent: 'center', alignContent: 'center' }}>
                🚨
              </span>
            }
            color={constants.colors.text}
            backgroundColor="#FEE2E2"
            text={t(AppGeneralKeys.accountDisconnectedInfo, {
              platforms: formatList(disconnectedAccounts),
            })}></Banner>
        )}
        {!hideShareInfo && (
          <Banner
            text={t(IntroKeys.shareInfo)}
            backgroundColor="#DAEDED"
            color="#374151"
            onClose={() => setHideShareInfo(true)}></Banner>
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

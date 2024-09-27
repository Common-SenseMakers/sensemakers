import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { BlueskyIcon, MastodonIcon, TwitterIcon } from '../app/common/Icons';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { I18Keys } from '../i18n/i18n';
import { RouteNames } from '../route.names';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { PlatformSection } from '../user-settings/PlatformsSection';
import {
  OverallLoginStatus,
  useAccountContext,
} from './contexts/AccountContext';
import { useBlueskyContext } from './contexts/platforms/BlueskyContext';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocialsPage = () => {
  const { t } = useTranslation();
  const {
    twitterProfile,
    mastodonProfile,
    blueskyProfile,
    setOverallLoginStatus,
  } = useAccountContext();
  const { connect: connectTwitter } = useTwitterContext();
  const { connect: connectMastodon, error: mastodonError } =
    useMastodonContext();
  const { connect: connectBluesky, error: blueskyError } = useBlueskyContext();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (twitterProfile || mastodonProfile || blueskyProfile) {
      setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
    }
  };

  const content = (() => {
    if (connectTwitter && connectMastodon && connectBluesky) {
      return (
        <Box>
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{t(I18Keys.connectSocialsTitle)}</AppHeading>
            <Box width="100%" height="16px"></Box>
            <AppParagraph margin={{ bottom: 'medium' }}>
              {t(I18Keys.connectSocialsParagraph)}
            </AppParagraph>
            <PlatformSection
              icon={
                twitterProfile ? (
                  <PlatformAvatar
                    profileImageUrl={twitterProfile?.profile_image_url}
                  />
                ) : (
                  <TwitterIcon size={40} color="black"></TwitterIcon>
                )
              }
              platformName={t(I18Keys.XTwitter)}
              onButtonClicked={() => connectTwitter('read')}
              buttonText={twitterProfile ? '' : 'connect'}
              username={twitterProfile ? `@${twitterProfile.username}` : ''}
              connected={!!twitterProfile}
            />
            <PlatformSection
              icon={
                mastodonProfile ? (
                  <PlatformAvatar profileImageUrl={mastodonProfile?.avatar} />
                ) : (
                  <MastodonIcon size={40} color="white"></MastodonIcon>
                )
              }
              platformName={'Mastodon'}
              onButtonClicked={() => {
                navigate(RouteNames.ConnectMastodon, {
                  state: { callbackUrl: window.location.href },
                });
              }}
              buttonText={mastodonProfile ? '' : 'connect'}
              username={
                mastodonProfile
                  ? `@${mastodonProfile.username}@${mastodonProfile.mastodonServer}`
                  : ''
              }
              connected={!!mastodonProfile}
            />
            <PlatformSection
              icon={
                blueskyProfile ? (
                  <PlatformAvatar profileImageUrl={blueskyProfile?.avatar} />
                ) : (
                  <BlueskyIcon size={40} color="white"></BlueskyIcon>
                )
              }
              platformName={'Bluesky'}
              onButtonClicked={() => {
                navigate(RouteNames.ConnectBluesky, {
                  state: { callbackUrl: window.location.href },
                });
              }}
              buttonText={blueskyProfile ? '' : 'connect'}
              username={blueskyProfile ? `@${blueskyProfile.username}` : ''}
              connected={!!blueskyProfile}
            />
            {mastodonError && (
              <Box margin={{ top: 'small' }}>
                <AppParagraph color="status-error">
                  {mastodonError}
                </AppParagraph>
              </Box>
            )}
            {blueskyError && (
              <Box margin={{ top: 'small' }}>
                <AppParagraph color="status-error">{blueskyError}</AppParagraph>
              </Box>
            )}
          </Box>
          <Box align="center" margin={{ top: 'large' }}>
            <AppButton
              primary
              label={t(I18Keys.continue)}
              onClick={handleContinue}
              disabled={!twitterProfile && !mastodonProfile && !blueskyProfile}
              style={{ width: '100%' }}
            />
          </Box>
        </Box>
      );
    } else {
      return <Loading></Loading>;
    }
  })();

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box style={{ flexGrow: 1 }}>{content}</Box>
    </Box>
  );
};

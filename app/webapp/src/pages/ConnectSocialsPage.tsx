import { Box } from 'grommet';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { POSTHOG_EVENTS } from '../analytics/posthog.events';
import { useAppFetch } from '../api/app.fetch';
import { BlueskyIcon, MastodonIcon } from '../app/common/PlatformsIcons';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { MAX_BUTTON_WIDTH, ViewportPage } from '../app/layout/Viewport';
import { IntroKeys } from '../i18n/i18n.intro';
import { PlatformsKeys } from '../i18n/i18n.platforms';
import { ALL_CLUSTER_NAME } from '../posts.fetcher/cluster.context';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useTwitterContext } from '../user-login/contexts/platforms/TwitterContext';
import { PlatformSection } from '../user-settings/PlatformsSection';

export enum LoginCase {
  signup = 'signup',
  login = 'login',
}

export const ConnectSocialsPage = () => {
  const loginCase = LoginCase.login;
  const appFetch = useAppFetch();
  const posthog = usePostHog();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { connectedUser, connectedPlatforms, getPlatformConnectedStatus } =
    useAccountContext();

  const { connect: connectTwitter } = useTwitterContext();

  const mastodonProfile = connectedUser?.profiles?.mastodon?.profile;
  const blueskyProfile = connectedUser?.profiles?.bluesky?.profile;

  const buttonText =
    loginCase === LoginCase.login ? t(IntroKeys.login) : t(IntroKeys.connect);

  const handleContinue = () => {
    posthog?.capture(POSTHOG_EVENTS.CLICKED_CONTINUE);
    appFetch('/api/auth/setOnboarded', {}, true).catch(console.error);
    navigate(AbsoluteRoutes.ClusterFeed(ALL_CLUSTER_NAME));
  };

  useEffect(() => {
    const alreadyConnected =
      connectedUser && connectedUser.details && connectedUser.details.onboarded;

    if (alreadyConnected) {
      navigate(AbsoluteRoutes.ClusterFeed(ALL_CLUSTER_NAME));
    }
  }, [connectedUser, navigate]);

  const content = (
    <Box pad={{ bottom: '24px', horizontal: '12px' }}>
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">
          {loginCase === LoginCase.login
            ? t(IntroKeys.loginTitle)
            : t(IntroKeys.signupTitle)}
        </AppHeading>

        <Box width="100%" height="4px"></Box>

        <AppParagraph margin={{ bottom: 'medium' }}>
          {loginCase === LoginCase.login
            ? t(IntroKeys.loginSubtitle)
            : t(IntroKeys.signupSubtitle)}
        </AppParagraph>

        <PlatformSection
          disabled={!connectTwitter}
          icon={
            mastodonProfile ? (
              <PlatformAvatar imageUrl={mastodonProfile?.avatar} />
            ) : (
              <MastodonIcon inverse size={40}></MastodonIcon>
            )
          }
          platformName={t(PlatformsKeys.Mastodon)}
          onButtonClicked={() => navigate(AbsoluteRoutes.ConnectMastodon)}
          buttonText={mastodonProfile ? '' : buttonText}
          username={mastodonProfile?.username || ''}
          platformStatus={getPlatformConnectedStatus(PLATFORM.Mastodon)}
        />

        <PlatformSection
          icon={
            blueskyProfile ? (
              <PlatformAvatar imageUrl={blueskyProfile?.avatar} />
            ) : (
              <BlueskyIcon inverse size={40}></BlueskyIcon>
            )
          }
          platformName={t(PlatformsKeys.Bluesky)}
          onButtonClicked={() => {
            navigate(AbsoluteRoutes.ConnectBluesky);
          }}
          buttonText={blueskyProfile ? '' : buttonText}
          username={blueskyProfile ? `@${blueskyProfile.username}` : ''}
          platformStatus={getPlatformConnectedStatus(PLATFORM.Bluesky)}
        />
      </Box>

      <BoxCentered margin={{ top: 'large' }}>
        <AppButton
          primary
          label={t(IntroKeys.continue)}
          onClick={handleContinue}
          disabled={connectedPlatforms.length === 0}
          style={{ width: '100%', maxWidth: MAX_BUTTON_WIDTH }}
        />
      </BoxCentered>
    </Box>
  );

  return (
    <ViewportPage addLogo content={content} justify="start"></ViewportPage>
  );
};

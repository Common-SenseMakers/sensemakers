import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { BlueskyIcon, MastodonIcon, TwitterIcon } from '../app/common/Icons';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { MAX_BUTTON_WIDTH } from '../app/layout/Viewport';
import { IntroKeys } from '../i18n/i18n.intro';
import { PlatformsKeys } from '../i18n/i18n.platforms';
import { AbsoluteRoutes, RouteNames } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { PlatformSection } from '../user-settings/PlatformsSection';
import {
  PlatformConnectedStatus,
  useAccountContext,
} from './contexts/AccountContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocials = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    connectedUser,
    connectedSourcePlatforms,
    setAlreadyConnected,
    getPlatformConnectedStatus,
  } = useAccountContext();

  const { connect: connectTwitter } = useTwitterContext();

  const twitterProfile = connectedUser?.profiles?.twitter;
  const mastodonProfile = connectedUser?.profiles?.mastodon;
  const blueskyProfile = connectedUser?.profiles?.bluesky;

  const handleContinue = () => {
    setAlreadyConnected(true);
  };

  const content = (
    <Box>
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{t(IntroKeys.connectSocialsTitle)}</AppHeading>
        <Box width="100%" height="4px"></Box>

        <AppParagraph margin={{ bottom: 'medium' }}>
          {t(IntroKeys.connectSocialsParagraph)}
        </AppParagraph>

        <PlatformSection
          disabled={!connectTwitter}
          icon={
            twitterProfile ? (
              <PlatformAvatar imageUrl={twitterProfile?.avatar} />
            ) : (
              <TwitterIcon size={40} color="black"></TwitterIcon>
            )
          }
          platformName={t(PlatformsKeys.XTwitter)}
          onButtonClicked={() => {
            if (connectTwitter) {
              connectTwitter('read').catch(console.error);
            }
          }}
          buttonText={twitterProfile ? '' : 'connect'}
          username={twitterProfile ? `@${twitterProfile.username}` : ''}
          connected={!!twitterProfile}
          connecting={
            getPlatformConnectedStatus(PLATFORM.Twitter) ===
            PlatformConnectedStatus.Connecting
          }
        />

        <PlatformSection
          disabled={!connectTwitter}
          icon={
            mastodonProfile ? (
              <PlatformAvatar imageUrl={mastodonProfile?.avatar} />
            ) : (
              <MastodonIcon size={40} color="white"></MastodonIcon>
            )
          }
          platformName={'Mastodon'}
          onButtonClicked={() => navigate(AbsoluteRoutes.ConnectMastodon)}
          buttonText={mastodonProfile ? '' : 'connect'}
          username={mastodonProfile?.username || ''}
          connected={!!mastodonProfile}
        />

        <PlatformSection
          icon={
            blueskyProfile ? (
              <PlatformAvatar imageUrl={blueskyProfile?.avatar} />
            ) : (
              <BlueskyIcon size={40} color="white"></BlueskyIcon>
            )
          }
          platformName={'Bluesky'}
          onButtonClicked={() => {
            navigate(RouteNames.ConnectBluesky);
          }}
          buttonText={blueskyProfile ? '' : 'connect'}
          username={blueskyProfile ? `@${blueskyProfile.username}` : ''}
          connected={!!blueskyProfile}
        />
      </Box>

      <BoxCentered margin={{ top: 'large' }}>
        <AppButton
          primary
          label={t(IntroKeys.continue)}
          onClick={handleContinue}
          disabled={connectedSourcePlatforms.length === 0}
          style={{ width: '100%', maxWidth: MAX_BUTTON_WIDTH }}
        />
      </BoxCentered>
    </Box>
  );

  return (
    <Box
      pad={{ horizontal: 'medium', bottom: 'large' }}
      style={{ flexGrow: 1 }}>
      <Box style={{ flexGrow: 1 }}>{content}</Box>
    </Box>
  );
};

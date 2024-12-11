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

export enum LoginCase {
  signup = 'signup',
  login = 'login',
}

export const ConnectSocials = (props: { loginCase: LoginCase }) => {
  const { loginCase } = props;

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { connectedUser, connectedPlatforms, getPlatformConnectedStatus } =
    useAccountContext();

  const { connect: connectTwitter } = useTwitterContext();

  const twitterProfile = connectedUser?.profiles?.twitter;
  const mastodonProfile = connectedUser?.profiles?.mastodon;
  const blueskyProfile = connectedUser?.profiles?.bluesky;

  const buttonText =
    loginCase === LoginCase.login ? t(IntroKeys.login) : t(IntroKeys.connect);

  const handleContinue = () => {
    navigate(AbsoluteRoutes.MyPosts);
  };

  const content = (
    <Box>
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
          buttonText={twitterProfile ? '' : buttonText}
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
          platformName={t(PlatformsKeys.Mastodon)}
          onButtonClicked={() => navigate(AbsoluteRoutes.ConnectMastodon)}
          buttonText={mastodonProfile ? '' : buttonText}
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
          platformName={t(PlatformsKeys.Bluesky)}
          onButtonClicked={() => {
            navigate(RouteNames.ConnectBluesky);
          }}
          buttonText={blueskyProfile ? '' : buttonText}
          username={blueskyProfile ? `@${blueskyProfile.username}` : ''}
          connected={!!blueskyProfile}
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
    <Box
      pad={{ horizontal: 'medium', bottom: 'large' }}
      style={{ flexGrow: 1 }}>
      <Box style={{ flexGrow: 1 }}>{content}</Box>
    </Box>
  );
};

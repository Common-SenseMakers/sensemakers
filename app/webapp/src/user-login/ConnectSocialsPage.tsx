import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { BlueskyIcon, MastodonIcon, TwitterIcon } from '../app/common/Icons';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { I18Keys } from '../i18n/i18n';
import { AbsoluteRoutes, RouteNames } from '../route.names';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { PlatformSection } from '../user-settings/PlatformsSection';
import { useAccountContext } from './contexts/AccountContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocialsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { connectedUser, connectedSourcePlatforms, setAlreadyConnected } =
    useAccountContext();

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
        <AppHeading level="1">{t(I18Keys.connectSocialsTitle)}</AppHeading>
        <Box width="100%" height="16px"></Box>

        <AppParagraph margin={{ bottom: 'medium' }}>
          {t(I18Keys.connectSocialsParagraph)}
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
          platformName={t(I18Keys.XTwitter)}
          onButtonClicked={() =>
            connectTwitter ? connectTwitter('read') : null
          }
          buttonText={twitterProfile ? '' : 'connect'}
          username={twitterProfile ? `@${twitterProfile.username}` : ''}
          connected={!!twitterProfile}
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

      <Box align="center" margin={{ top: 'large' }}>
        <AppButton
          primary
          label={t(I18Keys.continue)}
          onClick={handleContinue}
          disabled={connectedSourcePlatforms.length === 0}
          style={{ width: '100%' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box style={{ flexGrow: 1 }}>{content}</Box>
    </Box>
  );
};

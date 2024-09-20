import { Box } from 'grommet';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { MastodonIcon, TwitterIcon } from '../app/common/Icons';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { PlatformSection } from '../user-settings/PlatformsSection';
import {
  LoginFlowState,
  OverallLoginStatus,
  useAccountContext,
} from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/DisconnectUserContext';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';
import { isValidMastodonDomain } from './user.helper';

export const ConnectSocialsPage = () => {
  const { t } = useTranslation();
  const {
    loginFlowState,
    twitterProfile,
    mastodonProfile,
    setOverallLoginStatus,
  } = useAccountContext();
  const { connect: connectTwitter } = useTwitterContext();
  const { connect: connectMastodon, error: mastodonError } =
    useMastodonContext();
  const { disconnect } = useDisconnectContext();
  const [mastodonDomain, setMastodonDomain] = useState('');

  const handleContinue = () => {
    if (twitterProfile || mastodonProfile) {
      setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
    }
  };

  const content = (() => {
    if (connectTwitter && connectMastodon) {
      return (
        <Box style={{ flexGrow: 1 }}>
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{t(I18Keys.connectSocialsTitle)}</AppHeading>
            <Box width="100%" height="16px"></Box>
            <AppParagraph>{t(I18Keys.connectSocialsParagraph)}</AppParagraph>
            <AppParagraph addMargin>
              <Trans
                i18nKey={I18Keys.connectSocialsParagraph2}
                components={{ b: <b></b> }}></Trans>
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
              onButtonClicked={(inputText) =>
                connectMastodon(inputText || '', 'read')
              }
              buttonText={mastodonProfile ? '' : 'connect'}
              username={
                mastodonProfile
                  ? `@${mastodonProfile.username}@${mastodonProfile.mastodonServer}`
                  : ''
              }
              connected={!!mastodonProfile}
              hasInput={true}
              inputPlaceholder={t(I18Keys.mastodonServerPlaceholder)}
              isValidInput={isValidMastodonDomain}
            />
            {mastodonError && (
              <Box margin={{ top: 'small' }}>
                <AppParagraph color="status-error">
                  {mastodonError}
                </AppParagraph>
              </Box>
            )}
          </Box>
          <Box align="center" margin={{ top: 'medium' }}>
            <AppButton
              primary
              label={t(I18Keys.continue)}
              onClick={handleContinue}
              disabled={!twitterProfile && !mastodonProfile}
            />
          </Box>
          <Box align="center" margin={{ top: 'small' }}>
            <AppButton
              plain
              label={t(I18Keys.logout)}
              onClick={() => disconnect()}
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

import { Box, Text } from 'grommet';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  BlueskyIcon,
  MastodonIcon,
  TwitterIcon,
} from '../app/common/PlatformsIcons';
import { DocIcon } from '../app/icons/DocIcon';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { SupportIcon } from '../app/icons/SupportIcon';
import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PlatformsKeys } from '../i18n/i18n.platforms';
import { SettingsKeys } from '../i18n/i18n.settings';
import { AbsoluteRoutes, RouteNames } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import {
  PlatformConnectedStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { useDisconnectContext } from '../user-login/contexts/DisconnectUserContext';
import { useBlueskyContext } from '../user-login/contexts/platforms/BlueskyContext';
import { useMastodonContext } from '../user-login/contexts/platforms/MastodonContext';
import { useTwitterContext } from '../user-login/contexts/platforms/TwitterContext';
import { PlatformSection } from '../user-settings/PlatformsSection';
import { SettingsSection } from '../user-settings/SettingsSection';
import { getAppUrl } from '../utils/general';

export const SettingSectionTitle = (props: { value: string }) => {
  const { constants } = useThemeContext();
  return (
    <Text
      size="small"
      style={{ fontWeight: 600, color: constants.colors.textLight }}>
      {props.value}
    </Text>
  );
};

/** extract the postId from the route and pass it to a PostContext */
export const UserSettingsPage = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { connectedUser, getPlatformConnectedStatus } = useAccountContext();
  const { disconnect } = useDisconnectContext();

  const { needConnect: needConnectMastodon } = useMastodonContext();

  const { needConnect: needConnectBluesky } = useBlueskyContext();

  const { connect: connectTwitter, needConnect: needConnectTwitter } =
    useTwitterContext();

  const twitterProfile = connectedUser?.profiles?.twitter;
  const mastodonProfile = connectedUser?.profiles?.mastodon;
  const blueskyProfile = connectedUser?.profiles?.bluesky;

  const content = (() => {
    if (!connectedUser) {
      return (
        <BoxCentered fill>
          <Loading></Loading>
        </BoxCentered>
      );
    }

    return (
      <Box>
        <Box
          pad={{ horizontal: 'medium' }}
          style={{
            height: '40px',
            borderBottom: `1px solid ${constants.colors.border}`,
          }}
          justify="center">
          <AppHeading level="3">{t(SettingsKeys.settings)}</AppHeading>
        </Box>

        <Box
          pad={{ horizontal: 'medium', top: '24px' }}
          margin={{ bottom: '8px' }}>
          <SettingSectionTitle
            value={t(SettingsKeys.usingApp)}></SettingSectionTitle>
        </Box>

        <SettingsSection
          icon={<DocIcon size={24}></DocIcon>}
          title={t(SettingsKeys.readTheDocs)}
          description={
            <Trans
              i18nKey={SettingsKeys.readTheDocsDescription}
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
              components={{ a: <a></a> }}></Trans>
          }
          showChevron={false}></SettingsSection>

        <SettingsSection
          icon={<SupportIcon size={24}></SupportIcon>}
          title={t(SettingsKeys.getSupport)}
          description={
            <Trans
              i18nKey={SettingsKeys.getSupportDescription}
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
              components={{ a: <a></a> }}></Trans>
          }
          showChevron={false}></SettingsSection>

        <Box
          pad={{ horizontal: 'medium' }}
          margin={{ top: '24px', bottom: '8px' }}>
          <SettingSectionTitle
            value={t(SettingsKeys.yourAccounts)}></SettingSectionTitle>
        </Box>

        <PlatformSection
          icon={
            twitterProfile ? (
              <PlatformAvatar imageUrl={twitterProfile?.avatar} />
            ) : (
              <TwitterIcon inverse size={40} color="black"></TwitterIcon>
            )
          }
          platformName={t(PlatformsKeys.XTwitter)}
          onButtonClicked={() => {
            connectTwitter &&
              connectTwitter(
                'read',
                `${getAppUrl()}${AbsoluteRoutes.Settings}/${RouteNames.ConnectTwitter}`
              ).catch(console.error);
          }}
          buttonText={needConnectTwitter ? 'connect' : ''}
          username={twitterProfile ? `@${twitterProfile.username}` : ''}
          connecting={
            getPlatformConnectedStatus(PLATFORM.Twitter) ===
            PlatformConnectedStatus.Connecting
          }
          connected={twitterProfile !== undefined}></PlatformSection>

        <PlatformSection
          icon={
            mastodonProfile ? (
              <PlatformAvatar imageUrl={mastodonProfile?.avatar} />
            ) : (
              <MastodonIcon inverse size={40}></MastodonIcon>
            )
          }
          platformName={'Mastodon'}
          onButtonClicked={() => {
            navigate(AbsoluteRoutes.ConnectMastodon, {
              state: { callbackUrl: window.location.href },
            });
          }}
          buttonText={needConnectMastodon ? 'connect' : ''}
          username={mastodonProfile?.username || ''}
          connecting={
            getPlatformConnectedStatus(PLATFORM.Mastodon) ===
            PlatformConnectedStatus.Connecting
          }
          connected={mastodonProfile !== undefined}></PlatformSection>

        <PlatformSection
          icon={
            blueskyProfile ? (
              <PlatformAvatar imageUrl={blueskyProfile?.avatar} />
            ) : (
              <BlueskyIcon inverse size={40} color="white"></BlueskyIcon>
            )
          }
          platformName={'Bluesky'}
          onButtonClicked={() => {
            navigate(AbsoluteRoutes.ConnectBluesky, {
              state: { callbackUrl: window.location.href },
            });
          }}
          buttonText={needConnectBluesky ? 'connect' : ''}
          username={
            blueskyProfile ? `@${blueskyProfile.username}` : '- not connected -'
          }
          connecting={
            getPlatformConnectedStatus(PLATFORM.Bluesky) ===
            PlatformConnectedStatus.Connecting
          }
          connected={!!blueskyProfile}></PlatformSection>

        <Box
          direction="row"
          align="center"
          justify="between"
          pad={{ horizontal: '20px' }}
          margin={{ top: '54px', bottom: '8px' }}>
          <SettingSectionTitle
            value={
              t(SettingsKeys.logoutTitle) +
              (twitterProfile ? ` @${twitterProfile.username}` : '')
            }></SettingSectionTitle>
          <AppButton
            label={t(SettingsKeys.logout)}
            onClick={() => disconnect()}></AppButton>
        </Box>
      </Box>
    );
  })();

  return (
    <ViewportPage
      content={content}
      nav={<GlobalNav></GlobalNav>}
      justify="start"></ViewportPage>
  );
};

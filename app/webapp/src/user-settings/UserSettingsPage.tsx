import { Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { AutopostIcon } from '../app/icons/AutopostIcon';
import { BellIcon } from '../app/icons/BellIcon';
import { EmailIcon } from '../app/icons/EmailIcon';
import { OrcidIcon } from '../app/icons/OrcidIcon';
import { SupportIcon } from '../app/icons/SupportIcon';
import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { NotificationFreq } from '../shared/types/types.notifications';
import {
  AutopostOption,
  PLATFORM,
  UserSettingsUpdate,
} from '../shared/types/types.user';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useAutopostInviteContext } from '../user-login/contexts/AutopostInviteContext';
import { useDisconnectContext } from '../user-login/contexts/DisconnectUserContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { getAccount } from '../user-login/user.helper';
import { PlatformSection } from './PlatformsSection';
import { SettingsOptionSelector } from './SettingsOptionsSelector';
import { SettingsSection, SettingsSections } from './SettingsSection';
import { SettingsSubPage } from './UserSettingsSubpage';

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

  const appFetch = useAppFetch();

  const { connectedUser, refresh, twitterProfile } = useAccountContext();
  const [isSetting, setIsSetting] = useState(false);
  const { disconnect } = useDisconnectContext();

  const { connect: connectOrcid, connecting: connectingOrcid } =
    useOrcidContext();

  const { reviewAutopostIntention, setReviewAutopostIntention } =
    useAutopostInviteContext();

  const [showSettingsPage, setShowSettingsPage] = useState<
    SettingsSections | undefined
  >(undefined);

  // receive the autopost invite
  useEffect(() => {
    if (reviewAutopostIntention) {
      setReviewAutopostIntention(false);
      setShowSettingsPage(SettingsSections.Autopost);
    }
  }, [reviewAutopostIntention]);

  const setSettings = async (newSettings: UserSettingsUpdate) => {
    return appFetch('/api/auth/settings', newSettings).then(() => {
      setIsSetting(false);
      refresh();
    });
  };

  const setAutopost = (option: AutopostOption) => {
    if (connectedUser) {
      const settings = connectedUser.settings;
      const newSettings: UserSettingsUpdate = {
        autopost: {
          ...settings.autopost,
          [PLATFORM.Nanopub]: { value: option },
        },
      };

      setIsSetting(true);
      void setSettings(newSettings);
    }
  };

  const setNotifications = (notificationFreq: NotificationFreq) => {
    if (connectedUser) {
      const newSettings: UserSettingsUpdate = {
        notificationFreq,
      };

      void setSettings(newSettings);
    }
  };

  const currentAutopost =
    connectedUser?.settings?.autopost[PLATFORM.Nanopub].value;
  const currentNotifications = connectedUser?.settings?.notificationFreq;

  const orcid = getAccount(connectedUser, PLATFORM.Orcid);

  const autopostPage = (
    <SettingsSubPage
      title={t(I18Keys.publishingAutomation)}
      subtitle={t(I18Keys.publishingAutomationExplainer)}
      onBack={() => setShowSettingsPage(undefined)}
      content={
        <Box>
          <SettingsOptionSelector
            options={[
              {
                title: t(I18Keys.publishingAutomationOpt2Title),
                description: t(I18Keys.publishingAutomationOpt2Desc),
                id: AutopostOption.DETERMINISTIC,
                optionSelected: (id) => setAutopost(id as AutopostOption),
                selected: currentAutopost === AutopostOption.DETERMINISTIC,
              },
            ]}></SettingsOptionSelector>
          <SettingsOptionSelector
            options={[
              {
                title: t(I18Keys.publishingAutomationOpt3Title),
                description: t(I18Keys.publishingAutomationOpt3Desc),
                id: AutopostOption.MANUAL,
                optionSelected: (id) => setAutopost(id as AutopostOption),
                selected: currentAutopost === AutopostOption.MANUAL,
              },
            ]}></SettingsOptionSelector>
        </Box>
      }></SettingsSubPage>
  );

  const notificationsPage = (
    <SettingsSubPage
      title={t(I18Keys.notificationsSettings)}
      subtitle={t(I18Keys.notificationsSettingsExplainer)}
      onBack={() => setShowSettingsPage(undefined)}
      content={
        <Box>
          <SettingsOptionSelector
            options={[
              {
                title: t(I18Keys.notificationSettingsOpt1Title),
                description: t(I18Keys.notificationSettingsOpt1Desc),
                id: NotificationFreq.Daily,
                optionSelected: (id) =>
                  setNotifications(id as NotificationFreq),
                selected: currentNotifications === NotificationFreq.Daily,
              },
              {
                title: t(I18Keys.notificationSettingsOpt2Title),
                description: t(I18Keys.notificationSettingsOpt2Desc),
                id: NotificationFreq.Weekly,
                optionSelected: (id) =>
                  setNotifications(id as NotificationFreq),
                selected: currentNotifications === NotificationFreq.Weekly,
              },
              {
                title: t(I18Keys.notificationSettingsOpt3Title),
                description: t(I18Keys.notificationSettingsOpt3Desc),
                id: NotificationFreq.Monthly,
                optionSelected: (id) =>
                  setNotifications(id as NotificationFreq),
                selected: currentNotifications === NotificationFreq.Monthly,
              },
              {
                title: t(I18Keys.notificationSettingsOpt4Title),
                description: t(I18Keys.notificationSettingsOpt4Desc),
                id: NotificationFreq.None,
                optionSelected: (id) =>
                  setNotifications(id as NotificationFreq),
                selected: currentNotifications === NotificationFreq.None,
              },
            ]}></SettingsOptionSelector>
        </Box>
      }></SettingsSubPage>
  );

  const content = (() => {
    if (!connectedUser) {
      return (
        <BoxCentered fill>
          <Loading></Loading>
        </BoxCentered>
      );
    }

    if (showSettingsPage === SettingsSections.Autopost) {
      return autopostPage;
    }

    if (showSettingsPage === SettingsSections.Notifications) {
      return notificationsPage;
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
          <AppHeading level="3">{t(I18Keys.settings)}</AppHeading>
        </Box>

        <Box
          pad={{ horizontal: 'medium', top: '8px' }}
          margin={{ bottom: '24px' }}>
          <SettingSectionTitle
            value={t(I18Keys.downloads)}></SettingSectionTitle>
          <Box pad={{ vertical: '8px' }}>
            <Text
              style={{
                fontSize: '16px',
                color: constants.colors.checkboxes,
                fontWeight: '500',
                cursor: 'pointer',
              }}>
              {t(I18Keys.installApp)}
            </Text>
          </Box>
        </Box>

        <Box pad={{ horizontal: 'medium' }} margin={{ bottom: '8px' }}>
          <SettingSectionTitle
            value={t(I18Keys.usingApp)}></SettingSectionTitle>
        </Box>

        <SettingsSection
          icon={<AutopostIcon size={24}></AutopostIcon>}
          title={t(I18Keys.publishingAutomation)}
          onSectionClicked={() => {
            setShowSettingsPage(SettingsSections.Autopost);
          }}></SettingsSection>

        <SettingsSection
          icon={<BellIcon size={24}></BellIcon>}
          title={t(I18Keys.notificationsSettings)}
          onSectionClicked={() => {
            setShowSettingsPage(SettingsSections.Notifications);
          }}></SettingsSection>

        <SettingsSection
          icon={<SupportIcon size={24}></SupportIcon>}
          title={t(I18Keys.getSupport)}
          onSectionClicked={() => {
            setShowSettingsPage(SettingsSections.Support);
          }}></SettingsSection>

        <Box
          pad={{ horizontal: 'medium' }}
          margin={{ top: '24px', bottom: '8px' }}>
          <SettingSectionTitle
            value={t(I18Keys.yourAccounts)}></SettingSectionTitle>
        </Box>

        <PlatformSection
          icon={<TwitterAvatar profile={twitterProfile} />}
          platformName={t(I18Keys.XTwitter)}
          onButtonClicked={() => {}}
          buttonText=""
          username={twitterProfile ? `@${twitterProfile.username}` : ''}
          connected></PlatformSection>

        <PlatformSection
          icon={
            <BoxCentered
              style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#498283',
                borderRadius: '20px',
              }}>
              <EmailIcon></EmailIcon>
            </BoxCentered>
          }
          platformName={t(I18Keys.emailAddress)}
          onButtonClicked={() => {}}
          buttonText=""
          username={connectedUser?.email ? connectedUser.email?.email : ''}
          connected></PlatformSection>

        <PlatformSection
          icon={<OrcidIcon size={40}></OrcidIcon>}
          platformName={t(I18Keys.ORCID)}
          onButtonClicked={() => connectOrcid('/settings')}
          buttonText="connect"
          username={orcid ? `@${orcid.user_id}` : '- not connected -'}
          connected={orcid !== undefined}
          connecting={connectingOrcid}></PlatformSection>

        <Box margin={{ vertical: '36px' }} pad={{ horizontal: '16px' }}>
          <AppButton
            onClick={() => disconnect()}
            label={t(I18Keys.logout)}></AppButton>
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

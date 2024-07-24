import { Box, Image, Paragraph, Text } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import App from '../App';
import { useAppFetch } from '../api/app.fetch';
import { AutopostIcon } from '../app/icons/AutopostIcon';
import { BellIcon } from '../app/icons/BellIcon';
import { BulletIcon } from '../app/icons/BulletIcon';
import { EmailIcon } from '../app/icons/EmailIcon';
import { CheckIcon } from '../app/icons/FilterIcon copy';
import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { OrcidIcon } from '../app/icons/OrcidIcon';
import { RightChevronIcon } from '../app/icons/RightChveronIcon';
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
import { AppRadioButtom } from '../ui-components/AppRadioButton';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useDisconnectContext } from '../user-login/contexts/DisconnectUserContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { getAccount } from '../user-login/user.helper';

enum SettingsSections {
  Autopost = 'autopost',
  Notifications = 'notifications',
  Support = 'support',
}

const SettingSectionTitle = (props: { value: string }) => {
  const { constants } = useThemeContext();
  return (
    <Text
      size="small"
      style={{ fontWeight: 600, color: constants.colors.textLight }}>
      {props.value}
    </Text>
  );
};

const SettingsSection = (props: {
  icon: JSX.Element;
  title: string;
  onSectionClicked: () => void;
}) => {
  const { constants } = useThemeContext();

  return (
    <AppButton plain onClick={() => props.onSectionClicked()}>
      <Box
        pad={{ horizontal: '16px', vertical: '16px' }}
        direction="row"
        align="center"
        style={{ border: `1px solid ${constants.colors.border}` }}>
        <Box style={{ width: '30px' }}>{props.icon}</Box>
        <Box
          style={{
            flexGrow: 1,
            fontSize: '16px',
            lineHeight: '18px',
            fontWeight: 600,
          }}
          margin={{ horizontal: '8px' }}>
          {props.title}
        </Box>
        <Box>
          <RightChevronIcon size={20}></RightChevronIcon>
        </Box>
      </Box>
    </AppButton>
  );
};

const PlatformSection = (props: {
  icon: JSX.Element;
  platformName: string;
  username: string;
  buttonText: string;
  onButtonClicked: () => void;
  connected: boolean;
}) => {
  const { constants } = useThemeContext();

  return (
    <Box
      pad={{ horizontal: '16px', vertical: '16px' }}
      direction="row"
      align="center"
      style={{ border: `1px solid ${constants.colors.border}` }}>
      <Box style={{ width: '50px' }}>{props.icon}</Box>
      <Box
        style={{
          flexGrow: 1,
          fontSize: '16px',
          lineHeight: '18px',
          fontWeight: 600,
        }}
        margin={{ horizontal: '8px' }}>
        <Box>
          <Text>{props.platformName}</Text>
        </Box>
        <Box>
          <Text style={{ fontWeight: 500, color: constants.colors.textLight2 }}>
            {props.username}
          </Text>
        </Box>
      </Box>
      <Box>
        {!props.connected ? (
          <AppButton
            label={props.buttonText}
            onClick={() => props.onButtonClicked()}></AppButton>
        ) : (
          <Box
            direction="row"
            align="center"
            gap="4px"
            pad={{ horizontal: 'small' }}>
            <CheckIcon></CheckIcon>
            <Text
              style={{
                fontSize: '12px',
                lineHeight: '14px',
                color: '#038153',
              }}>
              Connected
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface SettingOption {
  id: string;
  title: string;
  description: string;
  selected?: boolean;
  optionSelected: (id: string) => void;
}

const SettingsOptionSelector = (props: { options: SettingOption[] }) => {
  const { constants } = useThemeContext();
  return (
    <Box>
      {props.options.map((option, ix) => {
        return (
          <AppButton plain onClick={() => option.optionSelected(option.id)}>
            <Box
              key={ix}
              direction="row"
              align="center"
              pad={{ horizontal: '20px', vertical: '16px' }}
              gap="12px"
              style={{
                backgroundColor: option.selected ? '#EDF7FF' : '#ffffff',
                border: `1px solid ${constants.colors.border}`,
              }}>
              <Box style={{ flexShrink: 0 }}>
                <BulletIcon selected={option.selected}></BulletIcon>
              </Box>
              <Box>
                <Box>
                  <Text style={{ fontWeight: 500 }}>{option.title}</Text>
                </Box>
                <Box>
                  <Text
                    style={{
                      color: constants.colors.textLight2,
                      fontWeight: 400,
                    }}>
                    {option.description}
                  </Text>
                </Box>
              </Box>
            </Box>
          </AppButton>
        );
      })}
    </Box>
  );
};

/** extract the postId from the route and pass it to a PostContext */
export const UserSettingsPage = () => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();

  const appFetch = useAppFetch();

  const { connectedUser, refresh, twitterProfile } = useAccountContext();
  const [isSetting, setIsSetting] = useState(false);

  const { connect: connectOrcid } = useOrcidContext();

  const [showSettingsPage, setShowSettingsPage] = useState<
    SettingsSections | undefined
  >(SettingsSections.Autopost);

  const setSettings = (newSettings: UserSettingsUpdate) => {
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

  const SettingsSubPage = (props: {
    title: string;
    subtitle: string;
    content: JSX.Element;
  }) => {
    return (
      <ViewportPage
        content={
          <Box style={{ flexGrow: 1 }}>
            <Box>
              <AppButton
                style={{
                  width: 'fit-content',
                  padding: '8px 12px',
                  fontWeight: 500,
                }}
                icon={
                  <Box pad={{ top: '1.5px' }}>
                    <LeftChevronIcon></LeftChevronIcon>
                  </Box>
                }
                plain
                label="Back"
                onClick={() => setShowSettingsPage(undefined)}></AppButton>
            </Box>

            <Box style={{ textAlign: 'center' }} margin={{ bottom: '8px' }}>
              <AppHeading level="3">{props.title}</AppHeading>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Paragraph>{props.subtitle}</Paragraph>
            </Box>

            <Box pad={{ horizontal: '16px', vertical: '24px' }}>
              {props.content}
            </Box>
          </Box>
        }></ViewportPage>
    );
  };

  const content = (() => {
    if (!connectedUser) {
      return (
        <BoxCentered fill>
          <Loading></Loading>
        </BoxCentered>
      );
    }

    if (showSettingsPage === SettingsSections.Autopost) {
      return (
        <SettingsSubPage
          title={t(I18Keys.notificationsSettings)}
          subtitle={t(I18Keys.notificationsSettingsExplainer)}
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
            setShowSettingsPage(SettingsSections.Autopost);
          }}></SettingsSection>

        <SettingsSection
          icon={<SupportIcon size={24}></SupportIcon>}
          title={t(I18Keys.getSupport)}
          onSectionClicked={() => {
            setShowSettingsPage(SettingsSections.Autopost);
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
          connected={orcid !== undefined}></PlatformSection>
        {/* 
        <>
          <Box margin={{ bottom: 'medium' }}>
            <Text>Email:</Text>
            <Text>{connectedUser.email?.email}</Text>
          </Box>
          <Text>Choose:</Text>
          <AppButton
            disabled={isSetting}
            primary={currentAutopost === AutopostOption.MANUAL}
            label="Manual"
            onClick={() => setAutopost(AutopostOption.MANUAL)}></AppButton>
          <AppButton
            disabled={isSetting}
            primary={currentAutopost === AutopostOption.DETERMINISTIC}
            label="Deterministic"
            onClick={() =>
              setAutopost(AutopostOption.DETERMINISTIC)
            }></AppButton>
          <AppButton
            disabled={isSetting}
            primary={currentAutopost === AutopostOption.AI}
            label="AI"
            onClick={() => setAutopost(AutopostOption.AI)}></AppButton>
        </>

        <Box pad="medium">
          <Text>Orcid:</Text>

          <AppButton
            primary
            disabled={orcid !== undefined}
            label={orcid === undefined ? 'Connect Orcid' : orcid.user_id}
            onClick={() => connectOrcid('/settings')}></AppButton>
        </Box>

        <Box pad="medium">
          <Text>Twitter:</Text>

          <AppButton
            primary
            disabled={twitterProfile !== undefined}
            label={
              twitterProfile === undefined
                ? 'Connect Twitter'
                : twitterProfile.username
            }
            onClick={() => {}}></AppButton>
        </Box>

        <Box pad="medium">
          <Text>Notifications:</Text>

          <AppButton
            primary={currentNotifications === NotificationFreq.None}
            label="None"
            onClick={() => setNotifications(NotificationFreq.None)}></AppButton>
          <AppButton
            primary={currentNotifications === NotificationFreq.Daily}
            label="Daily"
            onClick={() =>
              setNotifications(NotificationFreq.Daily)
            }></AppButton>
          <AppButton
            primary={currentNotifications === NotificationFreq.Weekly}
            label="Weekly"
            onClick={() =>
              setNotifications(NotificationFreq.Weekly)
            }></AppButton>
        </Box>

        <Box pad="medium">
          <Text>Logout:</Text>

          <AppButton
            margin={{ bottom: 'large' }}
            primary
            label="Logout"
            onClick={() => disconnect()}></AppButton>
        </Box>*/}
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

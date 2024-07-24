import { Box, Text } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { AutopostIcon } from '../app/icons/AutopostIcon';
import { BellIcon } from '../app/icons/BellIcon';
import { RightChevronIcon } from '../app/icons/RightChveronIcon';
import { SupportIcon } from '../app/icons/SupportIcon';
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
import { useDisconnectContext } from '../user-login/contexts/DisconnectUserContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { getAccount } from '../user-login/user.helper';

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

export const SettingsSection = (props: {
  icon: JSX.Element;
  title: string;
}) => {
  const { constants } = useThemeContext();

  return (
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
  );
};

/** extract the postId from the route and pass it to a PostContext */
export const UserSettingsPage = () => {
  const { disconnect } = useDisconnectContext();
  const { constants } = useThemeContext();
  const { t } = useTranslation();

  const appFetch = useAppFetch();

  const { connectedUser, refresh, twitterProfile } = useAccountContext();
  const [isSetting, setIsSetting] = useState(false);

  const { connect: connectOrcid } = useOrcidContext();

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
          title={t(I18Keys.publishingAutomation)}></SettingsSection>

        <SettingsSection
          icon={<BellIcon size={24}></BellIcon>}
          title={t(I18Keys.notificationsSettings)}></SettingsSection>

        <SettingsSection
          icon={<SupportIcon size={24}></SupportIcon>}
          title={t(I18Keys.getSupport)}></SettingsSection>

        <Box
          pad={{ horizontal: 'medium' }}
          margin={{ top: '24px', bottom: '8px' }}>
          <SettingSectionTitle
            value={t(I18Keys.yourAccounts)}></SettingSectionTitle>
        </Box>

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

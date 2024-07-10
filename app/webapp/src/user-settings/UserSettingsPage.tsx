import { Box, Text } from 'grommet';
import { CaretLeftFill } from 'grommet-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { AbsoluteRoutes } from '../route.names';
import { NotificationFreq } from '../shared/types/types.notifications';
import {
  AutopostOption,
  PLATFORM,
  UserSettings,
  UserSettingsUpdate,
} from '../shared/types/types.user';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';

/** extract the postId from the route and pass it to a PostContext */
export const UserSettingsPage = () => {
  const { constants } = useThemeContext();
  const navigate = useNavigate();
  const appFetch = useAppFetch();
  const { connectedUser, refresh } = useAccountContext();
  const [isSetting, setIsSetting] = useState(false);

  const { connect, connectWithWeb3 } = useNanopubContext();

  const hasNanopub =
    connectedUser && connectedUser.nanopub && connectedUser.nanopub.length > 0;

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

  if (!connectedUser) {
    return (
      <BoxCentered fill>
        <Loading></Loading>
      </BoxCentered>
    );
  }

  return (
    <Box>
      <AppButton
        margin={{ bottom: 'large' }}
        primary
        icon={
          <CaretLeftFill color={constants.colors.textOnPrimary}></CaretLeftFill>
        }
        label="back"
        onClick={() => navigate(AbsoluteRoutes.App)}></AppButton>
      <AppHeading>Settings</AppHeading>

      <Box pad="medium">
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
          onClick={() => setAutopost(AutopostOption.DETERMINISTIC)}></AppButton>
        <AppButton
          disabled={isSetting}
          primary={currentAutopost === AutopostOption.AI}
          label="AI"
          onClick={() => setAutopost(AutopostOption.AI)}></AppButton>
      </Box>

      <Box pad="medium">
        <Text>Connect:</Text>
        <AppButton
          primary
          disabled={hasNanopub}
          label={hasNanopub ? 'Connected' : 'Connect'}
          onClick={() => connect()}></AppButton>
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
          onClick={() => setNotifications(NotificationFreq.Daily)}></AppButton>
        <AppButton
          primary={currentNotifications === NotificationFreq.Weekly}
          label="Weekly"
          onClick={() => setNotifications(NotificationFreq.Weekly)}></AppButton>
      </Box>
    </Box>
  );
};

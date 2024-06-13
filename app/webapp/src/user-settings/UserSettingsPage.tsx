import { Box, Text } from 'grommet';
import { CaretLeftFill } from 'grommet-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { AbsoluteRoutes } from '../route.names';
import {
  AutopostOption,
  PLATFORM,
  UserSettings,
} from '../shared/types/types.user';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';

/** extract the postId from the route and pass it to a PostContext */
export const UserSettingsPage = () => {
  const { constants } = useThemeContext();
  const navigate = useNavigate();
  const appFetch = useAppFetch();
  const { connectedUser, refresh } = useAccountContext();
  const [isSetting, setIsSetting] = useState(false);

  const setAutopost = (option: AutopostOption) => {
    if (connectedUser) {
      const settings = connectedUser.settings;
      const newSettings: UserSettings = {
        ...settings,
        autopost: {
          ...settings.autopost,
          [PLATFORM.Nanopub]: { value: option },
        },
      };

      setIsSetting(true);
      appFetch('/api/auth/settings', newSettings).then(() => {
        setIsSetting(false);
        refresh();
      });
    }
  };

  const current = connectedUser?.settings?.autopost[PLATFORM.Nanopub].value;

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

      <Box>
        <Text>Choose:</Text>
      </Box>

      <AppButton
        disabled={isSetting}
        primary={current === AutopostOption.MANUAL}
        label="Manual"
        onClick={() => setAutopost(AutopostOption.MANUAL)}></AppButton>
      <AppButton
        disabled={isSetting}
        primary={current === AutopostOption.DETERMINISTIC}
        label="Deterministic"
        onClick={() => setAutopost(AutopostOption.DETERMINISTIC)}></AppButton>
      <AppButton
        disabled={isSetting}
        primary={current === AutopostOption.AI}
        label="AI"
        onClick={() => setAutopost(AutopostOption.AI)}></AppButton>
    </Box>
  );
};

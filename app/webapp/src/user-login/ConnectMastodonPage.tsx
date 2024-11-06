import { Box, Keyboard } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppLogo } from '../app/brand/AppLogo';
import { IntroKeys } from '../i18n/i18n.intro';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import {
  PlatformConnectedStatus,
  useAccountContext,
} from './contexts/AccountContext';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { isValidMastodonDomain } from './user.helper';

const DEFAULT_SERVER = 'mastodon.social';

export const ConnectMastodonPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { connect, error } = useMastodonContext();
  const { connectedUser, getPlatformConnectedStatus } = useAccountContext();
  const [mastodonServer, setMastodonServer] = useState('');

  useEffect(() => {
    const mastodonProfile = connectedUser?.profiles?.mastodon;
    if (mastodonProfile) {
      navigate(AbsoluteRoutes.App);
    }
  }, [connectedUser, navigate]);

  const handleConnect = () => {
    if (connect) {
      const server = isValidMastodonDomain(mastodonServer)
        ? mastodonServer
        : DEFAULT_SERVER;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callbackUrl = location.state?.callbackUrl as string | undefined;
      connect(server, 'read', callbackUrl || window.location.href).catch(
        console.error
      );
    }
  };

  const status = getPlatformConnectedStatus(PLATFORM.Mastodon);

  const { title, content } = useMemo((): {
    title: string;
    content: JSX.Element;
  } => {
    if (error) {
      return {
        title: 'Error',
        content: <AppParagraph color="status-error">{error}</AppParagraph>,
      };
    }

    if (!status || status === PlatformConnectedStatus.Disconnected) {
      return {
        title: t(IntroKeys.connectMastodonTitle),
        content: (
          <Keyboard onEnter={() => handleConnect()}>
            <>
              <AppParagraph margin={{ bottom: 'medium' }}>
                {t(IntroKeys.connectMastodonParagraph)}
              </AppParagraph>

              <AppParagraph
                margin={{ bottom: 'small' }}
                size="small"
                style={{ fontWeight: 'bold' }}>
                {t(IntroKeys.mastodonServer)}
              </AppParagraph>
              <Box margin={{ bottom: 'medium' }}>
                <AppButton label={DEFAULT_SERVER} primary></AppButton>
                <Box margin={{ vertical: 'medium' }}>
                  <AppParagraph>or, input another one:</AppParagraph>
                </Box>
                <AppInput
                  placeholder={t(IntroKeys.mastodonServerPlaceholder)}
                  value={mastodonServer}
                  onChange={(event) => setMastodonServer(event.target.value)}
                  style={{ width: '100%' }}
                />
              </Box>
              <Box align="center" margin={{ top: 'medium' }}>
                <AppButton
                  primary
                  label={t(IntroKeys.continue)}
                  onClick={handleConnect}
                  style={{ width: '100%' }}
                />
              </Box>
            </>
          </Keyboard>
        ),
      };
    }

    if (status === PlatformConnectedStatus.Connecting) {
      return {
        title: t(IntroKeys.connectingMastodon),
        content: (
          <BoxCentered>
            <Loading />
          </BoxCentered>
        ),
      };
    }

    if (status === PlatformConnectedStatus.Connected) {
      return {
        title: 'Connected to Mastodon',
        content: <></>,
      };
    }

    return {
      title: 'Connected to Mastodon',
      content: <></>,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, mastodonServer, status, t]);

  return (
    <Box
      pad={{ horizontal: 'medium', vertical: 'large' }}
      style={{ flexGrow: 1 }}>
      <AppLogo margin={{ bottom: 'xlarge' }} />
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{title}</AppHeading>
        <Box width="100%" height="16px" />
        {content}
      </Box>
    </Box>
  );
};

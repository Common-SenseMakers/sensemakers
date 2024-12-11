import { Box, Keyboard } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const mastodonProfile = connectedUser?.profiles?.mastodon;
    if (mastodonProfile) {
      navigate(AbsoluteRoutes.App);
    }
  }, [connectedUser, navigate]);

  useEffect(() => {
    if (error) {
      setIsConnecting(false);
    }
  }, [error]);

  const server = useMemo(() => {
    return !isValidMastodonDomain(mastodonServer)
      ? DEFAULT_SERVER
      : mastodonServer;
  }, [mastodonServer]);

  const handleConnect = () => {
    if (connect) {
      const callbackUrl =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (location.state?.callbackUrl as string | undefined) ||
        `${window.location.origin}${AbsoluteRoutes.ConnectMastodon}`;

      setIsConnecting(true);
      connect(server, 'read', callbackUrl).catch(console.error);
    }
  };

  const status = getPlatformConnectedStatus(PLATFORM.Mastodon);
  const continueLabel = `${t(IntroKeys.continue)} with ${server}`;

  const { title, content } = useMemo((): {
    title: string;
    content: JSX.Element;
  } => {
    if (status === PlatformConnectedStatus.Connecting || isConnecting) {
      return {
        title: t(IntroKeys.connectingMastodon),
        content: (
          <BoxCentered pad="large">
            <Loading />
          </BoxCentered>
        ),
      };
    }

    if (status === PlatformConnectedStatus.Connected) {
      return {
        title: 'Connected to Mastodon',
        content: (
          <AppButton
            onClick={() => navigate(AbsoluteRoutes.App)}
            label="Go Back"></AppButton>
        ),
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
                {`${t(IntroKeys.mastodonServer)}: ${server}`}
              </AppParagraph>
              <Box margin={{ bottom: 'medium' }}>
                <AppInput
                  placeholder={'or type another server'}
                  value={mastodonServer}
                  onChange={(event) => setMastodonServer(event.target.value)}
                  style={{ width: '100%' }}
                />
              </Box>
              <Box align="center" margin={{ top: 'medium' }}>
                <AppButton
                  primary
                  label={continueLabel}
                  onClick={handleConnect}
                  style={{ width: '100%' }}
                />
              </Box>
              {error && (
                <AppParagraph color="status-error">{error}</AppParagraph>
              )}
            </>
          </Keyboard>
        ),
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
      <AppHeading level="1">{title}</AppHeading>
      <Box width="100%" height="16px" />
      {content}
    </Box>
  );
};

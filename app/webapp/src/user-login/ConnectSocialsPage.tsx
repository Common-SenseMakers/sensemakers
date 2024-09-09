import { Anchor, Box, TextInput } from 'grommet';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { MastodonIcon, TwitterIcon } from '../app/common/Icons';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppInput } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { LoginFlowState, useAccountContext } from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/DisconnectUserContext';
import { useMastodonContext } from './contexts/platforms/MastodonContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocialsPage = (props: {}) => {
  const { t } = useTranslation();
  const { loginFlowState } = useAccountContext();
  const { connect: connectTwitter } = useTwitterContext();
  const { connect: connectMastodon } = useMastodonContext();
  const { disconnect } = useDisconnectContext();
  const [mastodonDomain, setMastodonDomain] = useState('');

  const isValidMastodonDomain = (input: string): boolean => {
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(input);
  };

  const content = (() => {
    if (connectTwitter && connectMastodon) {
      return (
        <Box style={{ flexGrow: 1 }}>
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{t(I18Keys.connectSocialsTitle)}</AppHeading>
            <Box width="100%" height="16px"></Box>
            <AppParagraph>
              {t(I18Keys.connectSocialsParagraphMastodon)}
            </AppParagraph>
            <AppParagraph addMargin>
              <Trans
                i18nKey={I18Keys.connectSocialsParagraph2}
                components={{ b: <b></b> }}></Trans>
            </AppParagraph>
            <Box margin={{ top: 'medium' }}>
              <AppParagraph>Mastodon Instance: </AppParagraph>
              <AppInput
                placeholder={'e.g. "mastodon.social"'}
                value={mastodonDomain}
                onChange={(event) => setMastodonDomain(event.target.value)}
                style={{ width: '100%' }}
              />
              <AppButton
                margin={{ top: 'small' }}
                primary
                disabled={
                  loginFlowState === LoginFlowState.ConnectingMastodon ||
                  !isValidMastodonDomain(mastodonDomain)
                }
                icon={<MastodonIcon color="white"></MastodonIcon>}
                label={t(I18Keys.signInMastodon)}
                onClick={() =>
                  connectMastodon(mastodonDomain, 'read')
                }></AppButton>
            </Box>
          </Box>
          <Box align="center">
            <Anchor onClick={() => disconnect()}>{t(I18Keys.logout)}</Anchor>
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

import { Anchor, Box } from 'grommet';
import { Google } from 'grommet-icons';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { EmailIcon } from '../app/icons/EmailIcon';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import {
  ConnectMode,
  useAppSigner,
} from '../user-login/contexts/signer/SignerContext';

export const AppWelcome = (props: {}) => {
  const { t } = useTranslation();
  const { connect, isConnecting } = useAppSigner();

  const content = (() => {
    if (connect) {
      return (
        <Box style={{ flexGrow: 1 }}>
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{t(I18Keys.introTitle)}</AppHeading>
            <Box width="100%" height="4px"></Box>
            <AppSubtitle>{t(I18Keys.introSubtitle)}</AppSubtitle>
            <Box width="100%" height="16px"></Box>
            <AppParagraph>{t(I18Keys.introParagraph1)}</AppParagraph>
            <AppParagraph addMargin>
              <Trans
                i18nKey={I18Keys.introParagraph2}
                components={{ b: <b></b> }}></Trans>
            </AppParagraph>
            <AppButton
              margin={{ top: 'large' }}
              icon={<EmailIcon></EmailIcon>}
              primary
              disabled={isConnecting}
              label={t(I18Keys.emailInputBtn)}
              onClick={() => connect(ConnectMode.email)}></AppButton>
            <AppButton
              margin={{ top: 'small' }}
              icon={<Google size={'18px'}></Google>}
              primary
              disabled={isConnecting}
              label={t(I18Keys.googleOAuthInputBtn)}
              onClick={() => connect(ConnectMode.googleOAuth)}></AppButton>
          </Box>
          <Box align="center">
            <Anchor href="https://sense-nets.xyz/privacy-policy">
              Privacy Policy
            </Anchor>
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

import { Anchor, Box } from 'grommet';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { useAppSigner } from '../user-login/contexts/signer/SignerContext';

export const AppWelcome = (props: {}) => {
  const { t } = useTranslation();
  const { connectMagic, isConnectingMagic } = useAppSigner();

  const content = (() => {
    if (connectMagic) {
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
              primary
              disabled={isConnectingMagic}
              label={t(I18Keys.emailInputBtn)}
              onClick={() => connectMagic(true, true)}></AppButton>
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

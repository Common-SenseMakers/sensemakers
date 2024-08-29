import { Anchor, Box } from 'grommet';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { TwitterIcon } from '../app/common/Icons';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { LoginFlowState, useAccountContext } from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/DisconnectUserContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocialsPage = (props: {}) => {
  const { t } = useTranslation();
  const { loginFlowState } = useAccountContext();
  const { connect: connectTwitter } = useTwitterContext();
  const { disconnect } = useDisconnectContext();

  const content = (() => {
    if (connectTwitter) {
      return (
        <Box style={{ flexGrow: 1 }}>
          <Box style={{ flexGrow: 1 }}>
            <AppHeading level="1">{t(I18Keys.connectSocialsTitle)}</AppHeading>
            <Box width="100%" height="16px"></Box>
            <AppParagraph>{t(I18Keys.connectSocialsParagraph)}</AppParagraph>
            <AppParagraph addMargin>
              <Trans
                i18nKey={I18Keys.connectSocialsParagraph2}
                components={{ b: <b></b> }}></Trans>
            </AppParagraph>
            <AppButton
              margin={{ top: 'large' }}
              primary
              disabled={loginFlowState === LoginFlowState.ConnectingTwitter}
              icon={<TwitterIcon></TwitterIcon>}
              label={t(I18Keys.signInX)}
              onClick={() => connectTwitter('read')}></AppButton>
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

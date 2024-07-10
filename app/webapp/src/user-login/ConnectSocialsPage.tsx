import { Box } from 'grommet';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { TwitterIcon } from '../app/common/Icons';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { Loading } from '../ui-components/LoadingDiv';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const ConnectSocialsPage = (props: {}) => {
  const { t } = useTranslation();
  const { connect: connectTwitter, isConnecting } = useTwitterContext();

  const content = (() => {
    if (connectTwitter) {
      return (
        <>
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
            disabled={isConnecting}
            icon={<TwitterIcon></TwitterIcon>}
            label={t(I18Keys.signInX)}
            onClick={() => connectTwitter('read')}></AppButton>
        </>
      );
    } else {
      return <Loading></Loading>;
    }
  })();
  return (
    <Box pad={{ horizontal: 'medium', vertical: 'large' }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box>{content}</Box>
    </Box>
  );
};

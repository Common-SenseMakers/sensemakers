import { Box, Paragraph } from 'grommet';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { TwitterIcon } from '../app/common/Icons';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { useTwitterContext } from '../user-login/contexts/platforms/TwitterContext';

export const AppWelcome = (props: {}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<number>(0);
  const {
    connect: connectTwitter,
    isConnecting: isConnectingTwitter,
    needConnect: needConnectTwitter,
  } = useTwitterContext();

  const content = (() => {
    if (state === 0) {
      return (
        <>
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
            icon={<TwitterIcon></TwitterIcon>}
            label={t(I18Keys.startBtn)}
            onClick={() => setState(1)}></AppButton>
        </>
      );
    }

    if (state === 1 && connectTwitter) {
      return (
        <>
          <AppHeading level="1">{t(I18Keys.connectAccounts)}</AppHeading>
          <Box width="100%" height="4px"></Box>
          <Paragraph>{t(I18Keys.connectParagraph)}</Paragraph>
          <AppButton
            disabled={isConnectingTwitter}
            margin={{ top: 'medium' }}
            icon={<TwitterIcon></TwitterIcon>}
            primary
            label={t(I18Keys.signInX)}
            onClick={() => connectTwitter('read')}></AppButton>
        </>
      );
    }
  })();
  return (
    <Box pad={{ horizontal: 'medium', vertical: 'large' }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box>{content}</Box>
    </Box>
  );
};

import { Box, Paragraph } from 'grommet';
import { Trans, useTranslation } from 'react-i18next';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppSubtitle } from '../ui-components';

export const AppWelcome = (props: {}) => {
  const { t } = useTranslation();
  return (
    <Box pad={{ horizontal: 'medium', vertical: 'large' }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box>
        <AppHeading>{t(I18Keys.introTitle)}</AppHeading>
        <Box width="100%" height="4px"></Box>
        <AppSubtitle>{t(I18Keys.introSubtitle)}</AppSubtitle>
        <Box width="100%" height="16px"></Box>
        <Paragraph>{t(I18Keys.introParagraph1)}</Paragraph>
        <Paragraph>
          <Trans
            i18nKey={I18Keys.introParagraph2}
            components={{ b: <b></b> }}></Trans>
        </Paragraph>
        <AppButton primary label={t(I18Keys.startBtn)}></AppButton>
      </Box>
    </Box>
  );
};

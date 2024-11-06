import { Box } from 'grommet';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

import { WelcomeKeys } from '../i18n/i18n.welcome';
import { AppHeading, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';

export const Welcome = () => {
  return (
    <Box style={{ flexGrow: 1 }}>
      <Box style={{ flexGrow: 1 }}>
        <AppHeading level="1">{t(WelcomeKeys.title)}</AppHeading>
        <Box width="100%" height="4px"></Box>
        <AppSubtitle>{t(WelcomeKeys.subtitle)}</AppSubtitle>
        <Box width="100%" height="16px"></Box>
        <AppParagraph>{t(WelcomeKeys.par1)}</AppParagraph>
        <AppParagraph addMargin>
          <Trans
            i18nKey={WelcomeKeys.bullet1}
            components={{ b: <b></b> }}></Trans>
        </AppParagraph>
        <AppParagraph addMargin>
          <Trans
            i18nKey={WelcomeKeys.bullet2}
            components={{ b: <b></b> }}></Trans>
        </AppParagraph>
        <AppParagraph addMargin>
          <Trans
            i18nKey={WelcomeKeys.bullet3}
            components={{ b: <b></b> }}></Trans>
        </AppParagraph>
        <AppParagraph addMargin>
          <Trans
            i18nKey={WelcomeKeys.bullet4}
            components={{ b: <b></b> }}></Trans>
        </AppParagraph>
        <AppParagraph addMargin>
          <Trans i18nKey={WelcomeKeys.par2} components={{ b: <b></b> }}></Trans>
        </AppParagraph>
      </Box>
    </Box>
  );
};

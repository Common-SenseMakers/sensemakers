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
        <Box style={{ flexGrow: 1 }} gap="16px">
          <AppSubtitle>{t(WelcomeKeys.subtitle)}</AppSubtitle>
          <AppParagraph>{t(WelcomeKeys.par1)}</AppParagraph>
          <WelcomeBullet emoji="📊" translationKey={WelcomeKeys.bullet1} />
          <WelcomeBullet emoji="💡" translationKey={WelcomeKeys.bullet2} />
          <WelcomeBullet emoji="💬" translationKey={WelcomeKeys.bullet3} />
          <WelcomeBullet emoji="👁️" translationKey={WelcomeKeys.bullet4} />
          <AppParagraph>
            <Trans
              i18nKey={WelcomeKeys.par2}
              components={{ b: <b></b> }}></Trans>
          </AppParagraph>
        </Box>
      </Box>
    </Box>
  );
};

interface WelcomeBulletProps {
  emoji: string;
  translationKey: string;
}

export const WelcomeBullet = ({
  emoji,
  translationKey,
}: WelcomeBulletProps) => {
  return (
    <Box
      direction="row"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
      }}>
      <Box
        style={{
          display: 'flex',
          padding: '0px 4px',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          fontFamily: 'Libre Franklin',
          fontStyle: 'normal',
          fontWeight: '800',
          lineHeight: '32px' /* 133.333% */,
          letterSpacing: '-0.48px',
        }}>
        {emoji}
      </Box>
      <AppParagraph
        style={{
          flex: '1 0 0',
        }}>
        <Trans i18nKey={translationKey} components={{ b: <b></b> }}></Trans>
      </AppParagraph>
    </Box>
  );
};

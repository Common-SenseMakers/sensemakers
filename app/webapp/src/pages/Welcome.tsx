import { Box, Image } from 'grommet';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { WelcomeKeys } from '../i18n/i18n.welcome';
import { AbsoluteRoutes } from '../route.names';
import { AppButton, AppHeading, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoginCase } from './ConnectSocialsPage';

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
          height: '32px',
          width: '32px',
        }}>
        <Image src={emoji}></Image>
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

export const Welcome = () => {
  const navigate = useNavigate();

  const setLoginCase = (loginCase: LoginCase) => {
    navigate(AbsoluteRoutes.Start);
  };

  return (
    <Box pad={{ bottom: '24px', horizontal: '12px' }}>
      <Box style={{ flexGrow: 1 }}>
        <Box style={{ flexGrow: 1 }}>
          <AppHeading level="1">{t(WelcomeKeys.title)}</AppHeading>
          <Box width="100%" height="4px"></Box>
          <Box style={{ flexGrow: 1 }} gap="16px">
            <AppSubtitle>{t(WelcomeKeys.subtitle)}</AppSubtitle>
            <AppParagraph>{t(WelcomeKeys.par1)}</AppParagraph>
            <WelcomeBullet
              emoji="/icons/intro/icon01.png"
              translationKey={WelcomeKeys.bullet1}
            />
            <WelcomeBullet
              emoji="/icons/intro/icon02.png"
              translationKey={WelcomeKeys.bullet2}
            />
            <WelcomeBullet
              emoji="/icons/intro/icon03.png"
              translationKey={WelcomeKeys.bullet3}
            />
            <WelcomeBullet
              emoji="/icons/intro/icon04.png"
              translationKey={WelcomeKeys.bullet4}
            />
            <WelcomeBullet
              emoji="/icons/intro/icon05.png"
              translationKey={WelcomeKeys.bullet5}
            />
            <AppParagraph>
              <Trans
                i18nKey={WelcomeKeys.par2}
                components={{ b: <b></b> }}></Trans>
            </AppParagraph>
          </Box>
        </Box>
      </Box>
      <BoxCentered gap="16px" direction="row">
        <AppButton
          style={{ flexGrow: 1 }}
          primary
          margin={{ top: 'large' }}
          label="Get started"
          onClick={() => setLoginCase(LoginCase.signup)}></AppButton>
      </BoxCentered>
    </Box>
  );
};

import { Box, Paragraph, Text } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageIcon } from '../app/icons/ImageIcon';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { CarouselDots } from '../ui-components/CarouselDots';

const IntroPage = (props: {
  icon: JSX.Element;
  heading: string;
  parragraphs: JSX.Element[];
  btnLabel: string;
  onNext: () => void;
}) => {
  const { icon, heading, parragraphs, btnLabel, onNext } = props;

  return (
    <Box id="page" style={{ flexGrow: 1, minHeight: '400px' }}>
      <Box align="center" style={{ flexGrow: 1 }}>
        <Box margin={{ bottom: '20px' }}>{icon}</Box>
        <AppHeading level={3}>{heading}</AppHeading>
        <Box margin={{ top: '8px' }}>
          {parragraphs.map((p, ix) => (
            <Paragraph
              key={ix}
              style={{
                marginBottom: ix < parragraphs.length ? '24px' : '0px',
                textAlign: 'center',
              }}>
              {p}
            </Paragraph>
          ))}
        </Box>
      </Box>

      <Box style={{ width: '100%' }}>
        <AppButton
          primary
          label={btnLabel}
          onClick={() => onNext()}></AppButton>
      </Box>
    </Box>
  );
};

const SectionIcon = (src: string) => {
  return (
    <BoxCentered
      style={{
        height: '60px',
        width: '60px',
        borderRadius: '40px',
        backgroundColor: '#CEE2F2',
      }}
      margin={{ bottom: '16px' }}>
      <ImageIcon src={src} size={40}></ImageIcon>
    </BoxCentered>
  );
};

export const IntroModal = (props: { closeModal: () => void }) => {
  const { closeModal } = props;

  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const pages = [
    <IntroPage
      icon={SectionIcon('/icons/intro/icon01.png')}
      heading={t(I18Keys.introHeading01)}
      parragraphs={[
        <Text>{t(I18Keys.introText011)}</Text>,
        <Text>{t(I18Keys.introText012)}</Text>,
      ]}
      btnLabel={t(I18Keys.introNextLabel)}
      onNext={() => next()}></IntroPage>,
    <IntroPage
      icon={SectionIcon('/icons/intro/icon02.png')}
      heading={t(I18Keys.introHeading02)}
      parragraphs={[
        <Text>{t(I18Keys.introText021)}</Text>,
        <Text>{t(I18Keys.introText022)}</Text>,
      ]}
      btnLabel={t(I18Keys.introNextLabel)}
      onNext={() => next()}></IntroPage>,
    <IntroPage
      icon={SectionIcon('/icons/intro/icon03.png')}
      heading={t(I18Keys.introHeading03)}
      parragraphs={[
        <Text>{t(I18Keys.introText031)}</Text>,
        <Text>{t(I18Keys.introText032)}</Text>,
      ]}
      btnLabel={t(I18Keys.introFinalLabel)}
      onNext={() => next()}></IntroPage>,
  ];

  const next = () => {
    if (step === pages.length - 1) {
      closeModal();
    }
    if (step < pages.length - 1) {
      setStep(step + 1);
    }
  };

  return (
    <Box style={{ flexGrow: 1 }} id="intro">
      {pages[step]}
      <Box align="center" width="100%">
        <CarouselDots
          nElements={3}
          selected={step}
          margin={{ top: '12px' }}></CarouselDots>
      </Box>
    </Box>
  );
};

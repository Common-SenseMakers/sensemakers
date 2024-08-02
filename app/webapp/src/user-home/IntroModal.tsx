import { Box, Text } from 'grommet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalContent, ModalIcon } from '../app/AppInfoModal';
import { I18Keys } from '../i18n/i18n';
import { CarouselDots } from '../ui-components/CarouselDots';

export const IntroModals = (props: { closeModal: () => void }) => {
  const { closeModal } = props;

  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const pages = [
    <ModalContent
      type="small"
      icon={ModalIcon('/icons/intro/icon01.png')}
      title={t(I18Keys.introHeading01)}
      parragraphs={[
        <Text>{t(I18Keys.introText011)}</Text>,
        <Text>{t(I18Keys.introText012)}</Text>,
      ]}
      primaryButton={{
        label: t(I18Keys.introNextLabel),
        onClick: () => next(),
      }}></ModalContent>,

    <ModalContent
      type="small"
      icon={ModalIcon('/icons/intro/icon02.png')}
      title={t(I18Keys.introHeading02)}
      parragraphs={[
        <Text>{t(I18Keys.introText021)}</Text>,
        <Text>{t(I18Keys.introText022)}</Text>,
      ]}
      primaryButton={{
        label: t(I18Keys.introNextLabel),
        onClick: () => next(),
      }}></ModalContent>,
    <ModalContent
      type="small"
      icon={ModalIcon('/icons/intro/icon03.png')}
      title={t(I18Keys.introHeading03)}
      parragraphs={[
        <Text>{t(I18Keys.introText031)}</Text>,
        <Text>{t(I18Keys.introText032)}</Text>,
      ]}
      primaryButton={{
        label: t(I18Keys.introFinalLabel),
        onClick: () => next(),
      }}></ModalContent>,
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

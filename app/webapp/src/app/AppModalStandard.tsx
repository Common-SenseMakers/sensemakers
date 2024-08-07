import { Box, Paragraph } from 'grommet';
import React from 'react';

import { AppModal } from '../ui-components';
import { AppButton } from '../ui-components/AppButton';
import { AppHeading } from '../ui-components/AppHeading';
import { BoxCentered } from '../ui-components/BoxCentered';
import { ImageIcon } from './icons/ImageIcon';

export interface ButtonConfig {
  disabled?: boolean;
  onClick: () => void;
  label: string;
}

export interface ModalContentProps {
  type?: 'small' | 'normal';
  icon?: JSX.Element;
  title: string | JSX.Element;
  parragraphs?: JSX.Element[];
  buttonsDirection?: 'row' | 'column';
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
}

export const ModalContent = (props: ModalContentProps) => {
  const {
    icon,
    title,
    parragraphs,
    primaryButton,
    secondaryButton,
    buttonsDirection,
  } = props;

  const btnsDirection = buttonsDirection ? buttonsDirection : 'row';

  const btnWidth =
    primaryButton && secondaryButton && btnsDirection === 'row'
      ? '50%'
      : '100%';

  return (
    <Box id="page" style={{ flexGrow: 1, minHeight: '400px' }}>
      <Box
        align="center"
        style={{ flexGrow: 1 }}
        justify="start"
        pad={{ top: '24px' }}>
        {icon ? <Box margin={{ bottom: '20px' }}>{icon}</Box> : <></>}
        <AppHeading level={props.type === 'small' ? 3 : 1}>{title}</AppHeading>
        <Box margin={{ top: '16px' }}>
          {parragraphs ? (
            parragraphs.map((p: JSX.Element, ix: number) => (
              <Paragraph
                key={ix}
                style={{
                  marginBottom: ix < parragraphs.length ? '24px' : '0px',
                  textAlign: 'center',
                }}>
                {p}
              </Paragraph>
            ))
          ) : (
            <></>
          )}
        </Box>
      </Box>

      {primaryButton || secondaryButton ? (
        <Box style={{ width: '100%' }} direction={btnsDirection} gap="12px">
          {secondaryButton ? (
            <AppButton
              style={{ width: btnWidth }}
              label={secondaryButton.label}
              onClick={() => secondaryButton.onClick()}
              disabled={secondaryButton.disabled}></AppButton>
          ) : (
            <></>
          )}
          {primaryButton ? (
            <AppButton
              primary
              style={{ width: btnWidth }}
              label={primaryButton.label}
              onClick={() => primaryButton.onClick()}
              disabled={primaryButton.disabled}></AppButton>
          ) : (
            <></>
          )}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

export const ModalIcon = (src: string) => {
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

export const AppModalStandard = (props: {
  type: 'small' | 'normal';
  onModalClosed: () => void;
  contentProps: ModalContentProps;
  backgroundColor?: string;
}) => {
  return (
    <AppModal
      type="small"
      onModalClosed={() => props.onModalClosed()}
      windowStyle={{ backgroundColor: props.backgroundColor }}>
      <ModalContent {...props.contentProps} type={props.type}></ModalContent>
    </AppModal>
  );
};

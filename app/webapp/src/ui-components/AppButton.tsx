import {
  Box,
  Button,
  ButtonExtendedProps,
  DropButton,
  DropButtonExtendedProps,
  Text,
} from 'grommet';
import { useState } from 'react';

import { AppModal, IAppModal } from './AppModal';
import { Loading } from './LoadingDiv';
import { useResponsive } from './ResponsiveApp';
import { useThemeContext } from './ThemedApp';

export type IButton = ButtonExtendedProps;

const circleButtonStyle: React.CSSProperties = {
  padding: '5px',
  border: '2px solid',
  borderRadius: '50%',
  textAlign: 'center',
};

export const AppButton = (props: IButton & { isLoading?: boolean }) => {
  const { constants } = useThemeContext();
  const newProps = { ...props };

  if (newProps.isLoading) {
    newProps.disabled = true;
    newProps.label = (
      <Box justify="center" direction="row">
        <Loading color={constants.colors.textOnPrimary}></Loading>
      </Box>
    );
  }

  return (
    <>
      <Button
        {...newProps}
        style={{
          fontSize: constants.fontSize.small.size,
          fontStyle: 'normal',
          fontWeight: 500,
          padding: !props.plain ? '6px 12px' : '0px',
          minHeight: !props.plain ? '42px' : 'auto',
          ...props.style,
        }}
      />
    </>
  );
};

export const AppCircleButton = (props: IButton) => {
  const { constants } = useThemeContext();
  circleButtonStyle.backgroundColor = constants.colors.white;
  circleButtonStyle.borderColor = constants.colors.border;

  return (
    <AppButton
      {...props}
      plain
      label=""
      style={{
        ...props.style,
        ...circleButtonStyle,
      }}></AppButton>
  );
};

export const AppButtonResponsive = (props: IButton) => {
  const { mobile } = useResponsive();
  return mobile ? (
    <AppCircleButton {...props}></AppCircleButton>
  ) : (
    <AppButton {...props}></AppButton>
  );
};

export const AppCircleDropButton = (props: DropButtonExtendedProps) => {
  const { constants } = useThemeContext();
  circleButtonStyle.borderColor = constants.colors.primary;

  return (
    <DropButton
      {...props}
      plain
      style={{ ...props.style, ...circleButtonStyle }}></DropButton>
  );
};

export const AppCircleDropButtonResponsive = (
  props: DropButtonExtendedProps
) => {
  const { mobile } = useResponsive();
  return !mobile ? (
    <DropButton {...props}></DropButton>
  ) : (
    <AppCircleDropButton {...props}></AppCircleDropButton>
  );
};

export const AppModalButtonResponsive = (props: {
  buttonProps: IButton;
  modalProps: IAppModal;
}) => {
  const [showDrop, setShowDrop] = useState<boolean>(false);

  return (
    <>
      <AppButton
        onClick={() => setShowDrop(!showDrop)}
        {...props.buttonProps}></AppButton>
      {showDrop ? (
        <AppModal
          onModalClosed={() => setShowDrop(false)}
          {...props.modalProps}></AppModal>
      ) : (
        <></>
      )}
    </>
  );
};

export const AppButtonTwoLinesLabel = (props: {
  tag?: JSX.Element | string;
  label?: JSX.Element | string;
}) => {
  return (
    <Box align="start">
      <Box>
        <Text size="xsmall">{props.tag}</Text>
      </Box>
      <Box>
        <Text>{props.label}</Text>
      </Box>
    </Box>
  );
};

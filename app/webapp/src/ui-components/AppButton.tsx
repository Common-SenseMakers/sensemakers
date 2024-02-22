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

export interface IButton extends ButtonExtendedProps {}

const circleButtonStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  padding: '6px',
  border: '2px solid',
  borderRadius: '50%',
  textAlign: 'center',
};

export const AppButton = (props: IButton & { loading?: boolean }) => {
  const { constants } = useThemeContext();
  const newProps = { ...props };
  if (newProps.loading) {
    newProps.disabled = true;
    newProps.label = <Loading color={constants.colors.textOnPrimary}></Loading>;
  }

  return (
    <>
      <Button
        {...newProps}
        style={{ textTransform: 'uppercase', ...props.style }}
      />
    </>
  );
};

export const AppCircleButton = (props: IButton) => {
  const { constants } = useThemeContext();
  circleButtonStyle.borderColor = constants.colors.primary;

  return (
    <AppButton
      {...props}
      plain
      label=""
      style={{ ...props.style, ...circleButtonStyle }}></AppButton>
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
          onClosed={() => setShowDrop(false)}
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

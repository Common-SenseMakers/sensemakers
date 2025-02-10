import { Box, Layer, LayerExtendedProps } from 'grommet';
import React from 'react';

export interface IAppModal extends LayerExtendedProps {
  type: 'small' | 'normal';
  layerProps?: LayerExtendedProps;
  windowStyle?: React.CSSProperties;
  onModalClosed?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const AppModal = (props: IAppModal) => {
  if (!props.children || Array.isArray(props.children)) {
    throw new Error('Modal must have exactly one child');
  }
  const child = React.cloneElement(props.children as React.ReactElement, {
    onSuccess: props.onSuccess,
    onModalClosed: props.onModalClosed,
    onError: props.onError,
  });

  const close = (): void => {
    if (props.onModalClosed) props.onModalClosed();
  };

  const position = props.position !== undefined ? props.position : 'center';

  const content = (
    <>
      <Box style={{ flexGrow: 1 }}>{child}</Box>
    </>
  );

  const wrappedContent = (() => {
    if (props.type === 'small') {
      return (
        <Box
          style={{
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow:
              '0px 6px 15px -2px rgba(16, 24, 40, 0.08), 0px 6px 15px -2px rgba(16, 24, 40, 0.08)',
            minHeight: '60vh',
            width: '100%',
            flexShrink: '0',
          }}>
          {content}
        </Box>
      );
    }

    return <Box pad={{ vertical: '24px', horizontal: '24px' }}>{content}</Box>;
  })();

  return (
    <Layer
      {...props.layerProps}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        ...props.style,
      }}
      position={position}
      onEsc={(): void => close()}
      onClickOutside={(): void => close()}
      animate={false}>
      <Box
        align="center"
        justify="center"
        style={{
          width: '100%',
          flexGrow: 1,
          ...props.windowStyle,
        }}>
        {wrappedContent}
      </Box>
    </Layer>
  );
};

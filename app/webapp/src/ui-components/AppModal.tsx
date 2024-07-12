import { Box, Layer, LayerExtendedProps, LayerPositionType } from 'grommet';
import { Close } from 'grommet-icons';
import React from 'react';

import { MAX_WIDTH_APP } from '../app/layout/Viewport';

export interface IAppModal extends LayerExtendedProps {
  layerProps?: LayerExtendedProps;
  onModalClosed?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const AppModal = (props: IAppModal) => {
  const child = React.cloneElement(props.children as React.ReactElement, {
    onSuccess: props.onSuccess,
    onModalClosed: props.onModalClosed,
    onError: props.onError,
  });

  const close = (): void => {
    if (props.onModalClosed) props.onModalClosed();
  };

  const position = props.position !== undefined ? props.position : 'center';

  return (
    <Layer
      {...props.layerProps}
      style={{
        background: 'rgba(17, 24, 39, 0.35)',
        ...props.style,
      }}
      position={position}
      onEsc={(): void => close()}
      onClickOutside={(): void => close()}
      animate={false}>
      <Box
        align="center"
        justify="center"
        style={{ width: '100%', height: '100vh' }}>
        <Box
          pad={{ vertical: '24px', horizontal: '24px' }}
          style={{
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow:
              '0px 6px 15px -2px rgba(16, 24, 40, 0.08), 0px 6px 15px -2px rgba(16, 24, 40, 0.08)',
            height: '60vh',
            width: '100%',
            maxWidth: `${MAX_WIDTH_APP * 0.8}px`,
            flexShrink: '0',
          }}>
          <Box style={{ flexShrink: '0' }}>
            <Box
              direction="row"
              onClick={(): void => close()}
              align="center"
              justify="end">
              <Close style={{ height: '12px', width: '12px' }}></Close>
            </Box>
          </Box>
          <Box style={{ flexGrow: 1 }}>{child}</Box>
        </Box>
      </Box>
    </Layer>
  );
};

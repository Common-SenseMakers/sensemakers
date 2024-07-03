import {
  Box,
  Layer,
  LayerExtendedProps,
  LayerPositionType,
  ResponsiveContext,
} from 'grommet';
import { Close } from 'grommet-icons';
import React from 'react';

import { MAX_WIDTH_APP } from '../app/layout/Viewport';
import { AppHeading } from './AppHeading';

export interface IAppModal extends LayerExtendedProps {
  heading: string;
  position?: LayerPositionType;
  onClosed?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const AppModal = (props: IAppModal) => {
  const child = React.cloneElement(props.children as React.ReactElement, {
    onSuccess: props.onSuccess,
    onClosed: props.onClosed,
    onError: props.onError,
  });

  const close = (): void => {
    if (props.onClosed) props.onClosed();
  };

  const size = React.useContext(ResponsiveContext);
  const mobile = size ? size.includes('small') : true;

  const position = props.position !== undefined ? props.position : 'center';

  return (
    <Layer
      {...props}
      style={{
        height: '60vh',
        maxWidth: `${MAX_WIDTH_APP * 0.8}px`,
        ...props.style,
      }}
      position={position}
      onEsc={(): void => close()}
      onClickOutside={(): void => close()}>
      <Box
        style={{
          paddingTop: '5vh',
          height: '100vh',
          width: mobile ? 'auto' : '550px',
          flexShrink: '0',
        }}>
        <Box style={{ padding: '0 2.5vw', flexShrink: '0' }}>
          <Box
            direction="row"
            style={{ marginBottom: '20px', padding: '4px 0px' }}
            onClick={(): void => close()}
            align="center"
            justify="end">
            <Close style={{ height: '12px', width: '12px' }}></Close>
          </Box>
          <AppHeading level="2">{props.heading}</AppHeading>
        </Box>
        <div style={{ overflowY: 'auto', padding: '0 2.5vw' }}>{child}</div>
      </Box>
    </Layer>
  );
};

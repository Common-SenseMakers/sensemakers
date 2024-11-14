import { Box, BoxExtendedProps } from 'grommet';
import { cloneElement, useState } from 'react';

export interface OnOverlayShown {
  onOverlayShown?: (shown: boolean) => void;
}

export const OverlayLayout = (props: {
  top: JSX.Element;
  bottom: JSX.Element;
  style?: BoxExtendedProps['style'];
}) => {
  const { top, bottom, style } = props;
  const [showTop, setShowTop] = useState(true);

  const onOverlayShown = (shown: boolean) => {
    setShowTop(!shown);
  };

  const _bottom = cloneElement(bottom, { onOverlayShown });

  return (
    <Box
      style={{
        backgroundColor: '#ffffff',
        flexGrow: 1,
        height: '100%',
        width: '100%',
        ...style,
      }}>
      {showTop && <Box style={{ flexShrink: 0 }}>{top}</Box>}
      <Box style={{ flexShrink: 0, flexGrow: 1, height: '100%' }}>
        {_bottom}
      </Box>
    </Box>
  );
};

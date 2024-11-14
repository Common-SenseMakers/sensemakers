import { Box } from 'grommet';
import { cloneElement, useState } from 'react';

export interface OnOverlayShown {
  onOverlayShown?: (shown: boolean) => void;
}

export const OverlayLayout = (props: {
  top: JSX.Element;
  bottom: JSX.Element;
}) => {
  const { top, bottom } = props;
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
      }}>
      {showTop && <Box style={{ flexShrink: 0 }}>{top}</Box>}
      <Box style={{ flexShrink: 0, height: '100%' }}>{_bottom}</Box>
    </Box>
  );
};

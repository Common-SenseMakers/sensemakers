import { Box } from 'grommet';
import { PropsWithChildren, createContext, useContext, useState } from 'react';

import { Overlay, ShowOverlayProps } from './Overlay';

export interface OverlayContextType {
  show: (shown: ShowOverlayProps) => void;
  close: () => void;
  overlay: ShowOverlayProps;
}

const OverlayContextValue = createContext<OverlayContextType | undefined>(
  undefined
);

export const OverlayContext = (props: PropsWithChildren) => {
  const [overlay, setOverlay] = useState<ShowOverlayProps>({});

  const show = (value: ShowOverlayProps) => {
    setOverlay(value);
  };

  const close = () => {
    setOverlay({});
  };

  return (
    <OverlayContextValue.Provider
      value={{
        show,
        close,
        overlay,
      }}>
      <Box
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}>
        <Box style={{ height: '100%', width: '100%' }}>{props.children}</Box>
        {Object.keys(overlay).length > 0 && (
          <Box
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              backgroundColor: '#ffffff',
              top: 0,
              left: 0,
            }}>
            <Overlay></Overlay>
          </Box>
        )}
      </Box>
    </OverlayContextValue.Provider>
  );
};

export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContextValue);
  if (!context) throw Error('context not found');
  return context;
};

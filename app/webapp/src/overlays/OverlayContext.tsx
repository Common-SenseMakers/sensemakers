import { Box } from 'grommet';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { OverlayNav } from '../overlays/OverlayNav';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { Overlay, OverlayValue } from './Overlay';
import { eventToOverlay } from './overlay.utils';

const DEBUG = true;

export enum OverlayQueryParams {
  Post = 'p',
  Ref = 'r',
  User = 'u',
  Profile = 'pr',
  Keyword = 'kw',
}

export interface OverlayContextType {
  level: number;
  onPostClick: (event: PostClickEvent) => void;
  onChildOverlayNav: (value: OverlayValue) => void;
  overlay: OverlayValue;
}

const OverlayContextValue = createContext<OverlayContextType | undefined>(
  undefined
);

export const OverlayContext = (
  props: PropsWithChildren & {
    init?: OverlayValue | null;
    onOverlayNav?: (value: OverlayValue) => void;
    level?: number;
  }
) => {
  const [overlay, _setOverlay] = useState<OverlayValue>(props.init || {});

  const parentOverlay = useOverlay();

  const level = parentOverlay ? parentOverlay.level + 1 : 0;

  const setOverlay = (value: OverlayValue) => _setOverlay(value);

  const close = () => {
    setOverlay({});
  };

  const onPostClick = (event: PostClickEvent) => {
    const newOverlay = eventToOverlay(event);
    if (newOverlay) {
      setOverlay(newOverlay);
    }
  };

  const onChildOverlayNav = (childOverlay: OverlayValue) => {
    if (DEBUG) {
      console.log(`OverlayContext onChildOverlayNav level: ${level}`, {
        overlay,
        childOverlay,
        level,
      });
    }

    const childClosed = Object.keys(childOverlay).length === 0;
    const activeOverlay = childClosed ? overlay : childOverlay;

    /** propagate upwards the active overlay */
    if (parentOverlay) {
      parentOverlay.onChildOverlayNav(activeOverlay);
    }

    /** propagate upwards through prop */
    if (props.onOverlayNav) {
      props.onOverlayNav(activeOverlay);
    }
  };

  /** detect this level overlay changes */
  useEffect(() => {
    if (DEBUG) {
      console.log(`OverlayContext useEffect overlay level: ${level}`, overlay);
    }

    if (parentOverlay) {
      parentOverlay.onChildOverlayNav(overlay);
    }

    /** propagate upwards through prop */
    if (props.onOverlayNav) {
      props.onOverlayNav(overlay);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);

  const showOverlay = Object.keys(overlay).length > 0;

  return (
    <OverlayContextValue.Provider
      value={{
        level,
        overlay,
        onPostClick,
        onChildOverlayNav,
      }}>
      <Box
        style={{
          height: '100%',
          width: '100%',
        }}>
        <Box style={{ height: '100%', width: '100%' }}>{props.children}</Box>
        {showOverlay && (
          <Box
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              backgroundColor: '#ffffff',
              top: 0,
            }}>
            <OverlayNav overlayNav={{ onBack: () => close() }}></OverlayNav>
            <Overlay></Overlay>
          </Box>
        )}
      </Box>
    </OverlayContextValue.Provider>
  );
};

export const useOverlay = (): OverlayContextType | undefined => {
  const context = useContext(OverlayContextValue);
  return context;
};

import { Box } from 'grommet';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { OverlayNav } from '../overlays/OverlayNav';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { useBack } from '../ui-components/hooks/useBack';
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
  setIsLast: (isLast: boolean) => void;
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
  const [isLast, _setIsLast] = useState(false);

  const parentOverlay = useOverlay();

  const level = parentOverlay ? parentOverlay.level + 1 : 0;

  const setOverlay = (value: OverlayValue) => {
    _setOverlay(value);

    if (Object.keys(value).length > 0) {
      /** mark as the last overlay whose content is shown */
      _setIsLast(true);

      /** mark parent as not the last */
      parentOverlay && parentOverlay.setIsLast(false);
    } else {
      _setIsLast(false);
      /** if closing, mark parent as last true */
      parentOverlay && parentOverlay.setIsLast(true);
    }

    if (DEBUG) {
      console.log(`OverlayContext setOverlay level: ${level}`, value);
    }

    /** propagate upwards through onChildOverlayNav */
    if (parentOverlay) {
      if (DEBUG) {
        console.log(`OverlayContext propagating upwards: ${level}`, value);
      }

      parentOverlay.onChildOverlayNav(value);
    }

    /** propagate upwards through prop */
    if (props.onOverlayNav) {
      if (DEBUG) {
        console.log(`OverlayContext propagating outwards: ${level}`, value);
      }

      props.onOverlayNav(value);
    }
  };

  const setIsLast = (isLast: boolean) => {
    _setIsLast(isLast);
    /** recursively mark as not being the last */
    if (isLast) {
      parentOverlay && parentOverlay.setIsLast(false);
    }
  };

  const close = () => {
    setOverlay({});
  };

  useBack(isLast, close);

  const onPostClick = (event: PostClickEvent) => {
    const newOverlay = eventToOverlay(event);
    if (newOverlay) {
      setOverlay(newOverlay);
    }
  };

  const onChildOverlayNav = useCallback(
    (childOverlay: OverlayValue) => {
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
    },
    [level, overlay, parentOverlay, props]
  );

  const showOverlay = Object.keys(overlay).length > 0;

  return (
    <OverlayContextValue.Provider
      value={{
        level,
        overlay,
        onPostClick,
        onChildOverlayNav,
        setIsLast,
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

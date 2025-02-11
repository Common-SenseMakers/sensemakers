import { Box } from 'grommet';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { OverlayNav } from '../overlays/OverlayNav';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { useBack } from '../ui-components/hooks/useBack';
import { Overlay, OverlayValue } from './Overlay';
import { eventToOverlay } from './overlay.utils';

const DEBUG = false;

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
  triggeredShowOverlay?: OverlayValue;
}

const OverlayContextValue = createContext<OverlayContextType | undefined>(
  undefined
);

export const OverlayContext = (
  props: PropsWithChildren & {
    init?: OverlayValue | null;
    onOverlayNav?: (value: OverlayValue) => void;
    level?: number;
    triggerShowOverlay?: OverlayValue; // if changed it is stacked on top
    triggerReset?: boolean; // if toggled, it resets the overlay
  }
) => {
  const [overlay, _setOverlay] = useState<OverlayValue>(props.init || {});
  const [isLast, _setIsLast] = useState(false);

  const parentOverlay = useOverlay();

  const level = parentOverlay ? parentOverlay.level + 1 : 0;

  /** this level state var of whether we a new overlay should be added */
  const [triggeredShowOverlay, setTriggeredShowOverlay] =
    useState<OverlayValue>();

  const showOverlay = Object.keys(overlay).length > 0;

  /** if external prop changes, replicate that in this context */
  useEffect(() => {
    if (DEBUG) {
      console.log(`OverlayContext useEffect props.triggerShowOverlay`, {
        propsDotTriggerShowOverlay: props.triggerShowOverlay,
        parentOverlay,
        overlay,
        level,
      });
    }

    if (props.triggerShowOverlay) {
      if (DEBUG) {
        console.log(
          `OverlayContext useEffect props.triggerShowOverlay setTriggeredShowOverlay`,
          {
            propsDotTriggerShowOverlay: props.triggerShowOverlay,
            parentOverlay,
            overlay,
            level,
          }
        );
      }

      setTriggeredShowOverlay(props.triggerShowOverlay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.triggerShowOverlay]);

  useEffect(() => {
    if (overlay) {
      if (DEBUG) {
        console.log(`OverlayContext useEffect triggerReset - close()`, {
          triggeredShowOverlay,
          parentOverlay,
          overlay,
          level,
        });
      }
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.triggerReset]);

  /** if parent triggerShowOverlay changes, replicate that in this, the child context */
  useEffect(() => {
    if (DEBUG) {
      console.log(
        `OverlayContext useEffect parentOverlay.triggeredShowOverlay`,
        {
          triggeredShowOverlay,
          parentOverlay,
          overlay,
          level,
        }
      );
    }

    if (parentOverlay?.triggeredShowOverlay) {
      if (DEBUG) {
        console.log(
          `OverlayContext useEffect parentOverlay.triggeredShowOverlay setTriggeredShowOverlay`,
          {
            triggeredShowOverlay,
            parentOverlay,
            overlay,
            level,
          }
        );
      }

      setTriggeredShowOverlay(parentOverlay.triggeredShowOverlay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentOverlay?.triggeredShowOverlay]);

  /** if triggeredShowOverlay state changes then set that overlay */
  useEffect(() => {
    if (DEBUG) {
      console.log(`OverlayContext useEffect triggeredShowOverlay`, {
        triggeredShowOverlay,
        overlay,
        level,
      });
    }

    if (triggeredShowOverlay && !showOverlay) {
      if (DEBUG) {
        console.log(
          `OverlayContext useEffect triggeredShowOverlay setOverlay`,
          {
            triggeredShowOverlay,
          }
        );
      }
      setOverlay(triggeredShowOverlay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggeredShowOverlay, isLast]);

  const setOverlay = (value: OverlayValue) => {
    if (DEBUG) {
      console.log(`OverlayContext setOverlay level: ${level}`, {
        value,
        triggeredShowOverlay,
        level,
      });
    }

    _setOverlay(value);
    setTriggeredShowOverlay(undefined);

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
    setTriggeredShowOverlay(undefined);
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

  return (
    <OverlayContextValue.Provider
      value={{
        level,
        overlay,
        onPostClick,
        onChildOverlayNav,
        setIsLast,
        triggeredShowOverlay,
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

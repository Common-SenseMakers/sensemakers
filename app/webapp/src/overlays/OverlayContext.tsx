import { Box } from 'grommet';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { OverlayNav } from '../overlays/OverlayNav';
import { DEBUG } from '../post/post.context/use.post.merge.deltas';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { Overlay, ShowOverlayProps } from './Overlay';
import { eventToOverlay } from './overlay.utils';

export enum OverlayQueryParams {
  Post = 'p',
  Ref = 'r',
  User = 'u',
  Profile = 'pr',
  Keyword = 'kw',
}

export interface OverlayContextType {
  setOverlay: (value: ShowOverlayProps) => void;
  close: () => void;
  onPostClick: (event: PostClickEvent) => void;
  syncQueryParams: () => void;
  overlay: ShowOverlayProps;
}

const OverlayContextValue = createContext<OverlayContextType | undefined>(
  undefined
);

export const OverlayContext = (
  props: PropsWithChildren & { init?: ShowOverlayProps | null }
) => {
  const [overlay, _setOverlay] = useState<ShowOverlayProps>(props.init || {});

  const [searchParams, setSearchParams] = useSearchParams();

  const parentOverlay = useOverlay();

  const setSearchParam = (key: string, value: string) => {
    if (DEBUG) console.log(`setSearchParam: ${key}=${value}`);

    searchParams.forEach((value, key) => {
      searchParams.delete(key);
    });
    searchParams.append(key, value);
    setSearchParams(searchParams);
  };

  const setOverlay = (value: ShowOverlayProps) => _setOverlay(value);

  const close = () => {
    _setOverlay({});
  };

  const onPostClick = (event: PostClickEvent) => {
    const newOverlay = eventToOverlay(event);
    if (newOverlay) {
      setOverlay(newOverlay);
    }
  };

  const syncQueryParams = () => {
    if (Object.keys(overlay).length === 0) {
      if (parentOverlay !== undefined) {
        parentOverlay.syncQueryParams();
      } else {
        searchParams.forEach((value, key) => {
          searchParams.delete(key);
        });
        setSearchParams(searchParams);
      }
      return;
    }

    if (overlay.post) {
      setSearchParam(OverlayQueryParams.Post, overlay.post.id);
      return;
    }
    if (overlay.ref) {
      setSearchParam(OverlayQueryParams.Ref, overlay.ref);
      return;
    }
    if (overlay.userId) {
      setSearchParam(OverlayQueryParams.User, overlay.userId);
      return;
    }
    if (overlay.profileId) {
      setSearchParam(OverlayQueryParams.Profile, overlay.profileId);
      return;
    }
    if (overlay.keyword) {
      setSearchParam(OverlayQueryParams.Keyword, overlay.keyword);
      return;
    }
  };

  useEffect(() => {
    syncQueryParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);

  const showOverlay = Object.keys(overlay).length > 0;

  return (
    <OverlayContextValue.Provider
      value={{
        setOverlay,
        close,
        overlay,
        onPostClick,
        syncQueryParams,
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

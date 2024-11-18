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
import {
  PostClickEvent,
  PostClickTarget,
} from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { Overlay, ShowOverlayProps } from './Overlay';

export interface OverlayContextType {
  show: (shown: ShowOverlayProps) => void;
  close: () => void;
  onPostClick: (event: PostClickEvent) => void;
  syncQueryParams: () => void;
  overlay: ShowOverlayProps;
}

const OverlayContextValue = createContext<OverlayContextType | undefined>(
  undefined
);

export const OverlayContext = (props: PropsWithChildren) => {
  const [overlay, setOverlay] = useState<ShowOverlayProps>({});

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

  const show = (value: ShowOverlayProps) => {
    setOverlay(value);
  };

  const close = () => {
    setOverlay({});
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
      setSearchParam('post', overlay.post.id);
      return;
    }
    if (overlay.ref) {
      setSearchParam('ref', overlay.ref);
      return;
    }
    if (overlay.userId) {
      setSearchParam('userId', overlay.userId);
      return;
    }
    if (overlay.profileId) {
      setSearchParam('profileId', overlay.profileId);
      return;
    }
    if (overlay.keyword) {
      setSearchParam('keyword', overlay.keyword);
      return;
    }
  };

  useEffect(() => {
    syncQueryParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);

  const showOverlay = Object.keys(overlay).length > 0;

  const onPostClick = (event: PostClickEvent) => {
    if (DEBUG) console.log('onPostClick', { event });

    if (event.target === PostClickTarget.POST) {
      const _post = event.payload as AppPostFull;

      if (DEBUG) console.log('onPostClick - setOverlay', { _post });
      show({ post: _post, postId: _post.id });
      return;
    }

    if (event.target === PostClickTarget.KEYWORD) {
      if (DEBUG) console.log('onPostClick - setOverlay', { event });
      show({ keyword: event.payload as string });
      return;
    }

    if (event.target === PostClickTarget.REF) {
      if (DEBUG) console.log('onPostClick - setOverlay', { event });
      show({ ref: event.payload as string });
      return;
    }

    if (
      [PostClickTarget.USER_ID, PostClickTarget.PLATFORM_USER_ID].includes(
        event.target
      )
    ) {
      if (DEBUG) console.log(`clicked on user ${event.payload as string}`);
      if (event.target === PostClickTarget.USER_ID) {
        if (DEBUG) console.log('onPostClick - setOverlay', { event });
        show({ userId: event.payload as string });
      }
      if (event.target === PostClickTarget.PLATFORM_USER_ID) {
        if (DEBUG) console.log('onPostClick - setOverlay', { event });
        show({ profileId: event.payload as string });
      }
      return;
    }
  };

  return (
    <OverlayContextValue.Provider
      value={{
        show,
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

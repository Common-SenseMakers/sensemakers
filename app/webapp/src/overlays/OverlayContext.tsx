import { Box } from 'grommet';
import { PropsWithChildren, createContext, useContext, useState } from 'react';

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
      }}>
      <Box
        style={{
          height: '100%',
          width: '100%',
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
            }}>
            <OverlayNav overlayNav={{ onBack: () => close() }}></OverlayNav>
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

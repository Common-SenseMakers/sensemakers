import { TouchEventHandler, useState } from 'react';

const DEBUG = false;

/** Needs to go together
 * <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}/> */
export const useSwap = (callbacks: {
  left?: () => void;
  right?: () => void;
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 30;

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    if (DEBUG) console.log('onTouchStart', e.targetTouches[0].clientX);
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    if (DEBUG) console.log('onTouchMove', e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    if (DEBUG) console.log('onTouchEnd', { touchStart, touchEnd });
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (DEBUG)
      console.log('onTouchEnd', { distance, isLeftSwipe, isRightSwipe });

    if (isLeftSwipe && callbacks.left) {
      callbacks.left();
    }

    if (isRightSwipe && callbacks.right) {
      callbacks.right();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

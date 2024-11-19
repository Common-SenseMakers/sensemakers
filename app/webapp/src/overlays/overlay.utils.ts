import {
  PostClickEvent,
  PostClickTarget,
} from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { ShowOverlayProps } from './Overlay';
import { OverlayQueryParams } from './OverlayContext';

const DEBUG = false;

export const hasSearchParam = (searchParams: URLSearchParams) => {
  return (
    Object.values(OverlayQueryParams).find((key) => searchParams.has(key)) !==
    undefined
  );
};

export const eventToOverlay = (
  event: PostClickEvent
): ShowOverlayProps | undefined => {
  if (DEBUG) console.log('onPostClick', { event });

  if (event.target === PostClickTarget.POST) {
    if (typeof event.payload === 'string') {
      if (DEBUG)
        console.log('onPostClick - setOverlay', { postId: event.payload });
      return { postId: event.payload };
    }

    const _post = event.payload as AppPostFull;

    if (DEBUG) console.log('onPostClick - setOverlay', { _post });
    return { post: _post, postId: _post.id };
  }

  if (event.target === PostClickTarget.KEYWORD) {
    if (DEBUG) console.log('onPostClick - setOverlay', { event });
    return { keyword: event.payload as string };
  }

  if (event.target === PostClickTarget.REF) {
    if (DEBUG) console.log('onPostClick - setOverlay', { event });
    return { ref: event.payload as string };
  }

  if (
    [PostClickTarget.USER_ID, PostClickTarget.PLATFORM_USER_ID].includes(
      event.target
    )
  ) {
    if (DEBUG) console.log(`clicked on user ${event.payload as string}`);
    if (event.target === PostClickTarget.USER_ID) {
      if (DEBUG) console.log('onPostClick - setOverlay', { event });
      return { userId: event.payload as string };
    }
    if (event.target === PostClickTarget.PLATFORM_USER_ID) {
      if (DEBUG) console.log('onPostClick - setOverlay', { event });
      return { profileId: event.payload as string };
    }
    return;
  }
};

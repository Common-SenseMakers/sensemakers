import { useMemo } from 'react';

import { OverlayNav } from '../post/OverlayNav';
import { PostOverlay } from '../post/PostOverlay';
import { RefOverlay } from '../post/RefOverlay';
import { UserProfileOverlay } from '../post/UserProfileOverlay';
import { AppPostFull } from '../shared/types/types.posts';
import { useOverlay } from './OverlayContext';

export interface ShowOverlayProps {
  post?: AppPostFull;
  postId?: string;
  ref?: string;
  userId?: string;
  profileId?: string;
}

export const Overlay = () => {
  const { overlay, close } = useOverlay();

  const content = useMemo(() => {
    const { post, postId, ref, userId, profileId } = overlay;
    if (post && postId) {
      return <PostOverlay postId={post.id} postInit={post}></PostOverlay>;
    }

    if (ref) {
      return <RefOverlay refUrl={ref} overlayNav={{}}></RefOverlay>;
    }

    if (userId || profileId) {
      return (
        <UserProfileOverlay
          userId={userId}
          profileId={profileId}
          overlayNav={{}}></UserProfileOverlay>
      );
    }
  }, [overlay]);
  return (
    <>
      <OverlayNav overlayNav={{ onBack: () => close() }}></OverlayNav>
      {content}
    </>
  );
};

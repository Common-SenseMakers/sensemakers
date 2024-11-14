import { useMemo } from 'react';

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
  const { overlay } = useOverlay();

  const content = useMemo(() => {
    const { post, postId, ref, userId, profileId } = overlay;
    if (post && postId) {
      return <PostOverlay postId={post.id} postInit={post}></PostOverlay>;
    }

    if (ref) {
      return <RefOverlay refUrl={ref}></RefOverlay>;
    }

    if (userId || profileId) {
      return (
        <UserProfileOverlay
          userId={userId}
          profileId={profileId}></UserProfileOverlay>
      );
    }
  }, [overlay]);
  return <>{content}</>;
};

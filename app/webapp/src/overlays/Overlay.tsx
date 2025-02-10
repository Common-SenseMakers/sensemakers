import { useMemo } from 'react';

import { AppPostFull } from '../shared/types/types.posts';
import { KeywordOverlay } from './KeywordOverlay';
import { useOverlay } from './OverlayContext';
import { PostOverlay } from './PostOverlay';
import { RefOverlay } from './RefOverlay';
import { UserProfileOverlay } from './UserProfileOverlay';

export interface OverlayValue {
  post?: AppPostFull;
  postId?: string;
  ref?: string;
  userId?: string;
  keyword?: string;
  profileId?: string;
}

export const Overlay = () => {
  const overlay = useOverlay();

  const content = useMemo(() => {
    if (!overlay) {
      return <></>;
    }

    const { post, postId, ref, userId, profileId, keyword } = overlay.overlay;
    if (post || postId) {
      const _postId = post ? post.id : (postId as string);
      return <PostOverlay postId={_postId} postInit={post}></PostOverlay>;
    }

    if (ref) {
      return <RefOverlay refUrl={ref}></RefOverlay>;
    }

    if (keyword) {
      return <KeywordOverlay keyword={keyword}></KeywordOverlay>;
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

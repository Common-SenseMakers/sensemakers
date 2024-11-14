import { PostOverlay } from '../post/PostOverlay';
import { RefOverlay } from '../post/RefOverlay';
import { UserProfileOverlay } from '../post/UserProfileOverlay';
import { AppPostFull } from '../shared/types/types.posts';

export interface ShowOverlayProps {
  post?: AppPostFull;
  postId?: string;
  ref?: string;
  userId?: string;
  profileId?: string;
}

export const Overlay = (props: ShowOverlayProps) => {
  const { post, postId, ref, userId, profileId } = props;

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

  return <></>;
};

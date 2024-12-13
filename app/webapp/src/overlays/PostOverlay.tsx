import { Box } from 'grommet';

import { PostView } from '../post/PostView';
import { PostContext } from '../post/post.context/PostContext';
import { AppPostFull } from '../shared/types/types.posts';
import { OverlayContext } from './OverlayContext';
import { OnOverlayNav } from './OverlayNav';
import { usePublicFeed } from './PublicFeedContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostOverlay = (props: {
  postId: string;
  postInit?: AppPostFull;
  overlayNav?: OnOverlayNav;
}) => {
  const { postId, postInit, overlayNav } = props;
  const publicFeedContext = usePublicFeed();
  const isPublicFeed = publicFeedContext && publicFeedContext.isPublicFeed;

  return (
    <OverlayContext>
      <Box style={{ height: '100%' }}>
        <PostContext postId={postId} postInit={postInit} showCelebration>
          <PostView
            isPublicFeed={isPublicFeed}
            overlayNav={overlayNav}></PostView>
        </PostContext>
      </Box>
    </OverlayContext>
  );
};

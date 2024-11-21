import { Box } from 'grommet';

import { PostView } from '../post/PostView';
import { PostContext } from '../post/post.context/PostContext';
import { AppPostFull } from '../shared/types/types.posts';
import { OverlayContext } from './OverlayContext';
import { OnOverlayNav } from './OverlayNav';

/** extract the postId from the route and pass it to a PostContext */
export const PostOverlay = (props: {
  postId: string;
  postInit?: AppPostFull;
  overlayNav?: OnOverlayNav;
}) => {
  const { postId, postInit, overlayNav } = props;

  return (
    <OverlayContext>
      <Box style={{ height: '100%' }}>
        <PostContext postId={postId} postInit={postInit} showCelebration>
          <PostView overlayNav={overlayNav}></PostView>
        </PostContext>
      </Box>
    </OverlayContext>
  );
};

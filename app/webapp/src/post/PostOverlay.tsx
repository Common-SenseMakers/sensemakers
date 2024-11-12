import { Box } from 'grommet';

import { AppPostFull } from '../shared/types/types.posts';
import { OnOverlayNav } from './OverlayNav';
import { PostView } from './PostView';
import { PostContext } from './post.context/PostContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostOverlay = (props: {
  postId: string;
  postInit?: AppPostFull;
  overlayNav?: OnOverlayNav;
}) => {
  const { postId, postInit, overlayNav } = props;

  return (
    <Box style={{ height: '100%' }}>
      <PostContext postId={postId} postInit={postInit} showCelebration>
        <PostView overlayNav={overlayNav}></PostView>
      </PostContext>
    </Box>
  );
};
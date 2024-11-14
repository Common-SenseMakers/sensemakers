import { Box } from 'grommet';

import { OverlayContext } from '../posts.fetcher/OverlayContext';
import { PostClickEvent } from '../semantics/patterns/patterns';
import { AppPostFull } from '../shared/types/types.posts';
import { OnOverlayNav } from './OverlayNav';
import { PostView } from './PostView';
import { PostContext } from './post.context/PostContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostOverlay = (props: {
  postId: string;
  postInit?: AppPostFull;
  overlayNav?: OnOverlayNav;
  onPostClick?: (event: PostClickEvent) => void;
}) => {
  const { postId, postInit, overlayNav } = props;

  return (
    <OverlayContext>
      <Box style={{ height: '100%' }}>
        <PostContext postId={postId} postInit={postInit} showCelebration>
          <PostView
            overlayNav={overlayNav}
            onPostClick={props.onPostClick}></PostView>
        </PostContext>
      </Box>
    </OverlayContext>
  );
};

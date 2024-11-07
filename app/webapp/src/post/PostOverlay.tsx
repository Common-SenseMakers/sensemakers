import { Box } from 'grommet';

import { AppPostFull } from '../shared/types/types.posts';
import { AppModal } from '../ui-components';
import { OnPostNav } from './PostNav';
import { PostView } from './PostView';
import { PostContext } from './post.context/PostContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostOverlay = (props: {
  postId: string;
  postInit?: AppPostFull;
  onPostNav?: OnPostNav;
}) => {
  const { postId, postInit, onPostNav } = props;

  const onClose = () => {
    onPostNav && onPostNav.onBack && onPostNav.onBack();
  };

  return (
    <AppModal
      type="normal"
      windowStyle={{ backgroundColor: '#FFFFFF' }}
      layerProps={{
        full: true,
      }}
      onClickOutside={() => onClose()}
      onModalClosed={() => onClose()}>
      <Box style={{ height: '100vh' }}>
        <PostContext postId={postId} postInit={postInit} showCelebration>
          <PostView onPostNav={onPostNav}></PostView>
        </PostContext>
      </Box>
    </AppModal>
  );
};

import { Box } from 'grommet';
import { useParams } from 'react-router-dom';

import { AppBottomNav } from '../app/layout/AppBottomNav';
import { ViewportPage } from '../app/layout/Viewport';
import { useUserPosts } from '../user-home/UserPostsContext';
import { PostContent } from './PostContent';
import { PostContext } from './PostContext';
import { PostHeader } from './PostHeader';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { id } = useParams();
  const { posts } = useUserPosts();

  const currPostIndex = posts?.findIndex((p) => p.id === id);
  const prevPostId =
    posts && currPostIndex != undefined && currPostIndex > 0
      ? posts[currPostIndex - 1].id
      : undefined;

  const nextPostId =
    posts && currPostIndex != undefined && currPostIndex < posts.length - 1
      ? posts[currPostIndex + 1].id
      : undefined;

  const content = (
    <Box round="small">
      <PostHeader prevPostId={prevPostId} nextPostId={nextPostId}></PostHeader>
      <PostContent></PostContent>
    </Box>
  );

  const rightClicked = () => {};

  return (
    <ViewportPage
      content={<PostContext postId={id}>{content}</PostContext>}
      nav={
        <AppBottomNav
          paths={[
            { action: rightClicked, label: 'ignore' },
            { action: rightClicked, label: 'approve' },
          ]}></AppBottomNav>
      }></ViewportPage>
  );
};

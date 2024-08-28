import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { PostContext, PostActionsProvider } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { postId } = useParams();
  const { getPost } = useUserPosts();
  const { twitterProfile } = useAccountContext();

  const postInit = useMemo(
    () => (postId ? getPost(postId) : undefined),
    [postId]
  );

  return (
    <PostActionsProvider>
      <PostContext postId={postId} postInit={postInit}>
        <PostView profile={twitterProfile}></PostView>
      </PostContext>
    </PostActionsProvider>
  );
};

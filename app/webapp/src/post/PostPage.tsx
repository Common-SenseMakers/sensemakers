import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserPosts } from '../user-home/UserPostsContext';
import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { postId } = useParams();
  const { getPost } = useUserPosts();

  const postInit = useMemo(
    () => (postId ? getPost(postId) : undefined),
    [postId]
  );

  return (
    <PostContext postId={postId} postInit={postInit}>
      <PostView></PostView>
    </PostContext>
  );
};

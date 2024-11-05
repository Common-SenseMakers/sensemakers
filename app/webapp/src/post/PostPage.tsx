import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserPosts } from '../user-home/UserPostsContext';
import { PostView } from './PostView';
import { PostContext } from './post.context/PostContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { postId } = useParams();
  const { feed } = useUserPosts();

  const postInit = useMemo(
    () => (postId ? feed.getPost(postId) : undefined),
    [feed, postId]
  );

  return (
    <PostContext postId={postId} postInit={postInit} showCelebration>
      <PostView></PostView>
    </PostContext>
  );
};

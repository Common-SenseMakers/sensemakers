import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { postId } = useParams();
  const { posts, getPost } = useUserPosts();
  const { twitterProfile } = useAccountContext();

  const postInit = useMemo(
    () => (postId ? getPost(postId) : undefined),
    [postId]
  );

  const currPostIndex = posts?.findIndex((p) => p.id === postId);
  const prevPostId =
    posts && currPostIndex != undefined && currPostIndex > 0
      ? posts[currPostIndex - 1].id
      : undefined;

  const nextPostId =
    posts && currPostIndex != undefined && currPostIndex < posts.length - 1
      ? posts[currPostIndex + 1].id
      : undefined;

  return (
    <PostContext postId={postId} postInit={postInit}>
      <PostView
        prevPostId={prevPostId}
        nextPostId={nextPostId}
        profile={twitterProfile}></PostView>
    </PostContext>
  );
};

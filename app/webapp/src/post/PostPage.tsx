import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useUserPosts } from '../user-home/UserPostsContext';
import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { id } = useParams();
  const { posts, getPost } = useUserPosts();

  const postInit = useMemo(() => (id ? getPost(id) : undefined), [id]);

  const currPostIndex = posts?.findIndex((p) => p.id === id);
  const prevPostId =
    posts && currPostIndex != undefined && currPostIndex > 0
      ? posts[currPostIndex - 1].id
      : undefined;

  const nextPostId =
    posts && currPostIndex != undefined && currPostIndex < posts.length - 1
      ? posts[currPostIndex + 1].id
      : undefined;

  return (
    <PostContext postId={id} postInit={postInit}>
      <PostView prevPostId={prevPostId} nextPostId={nextPostId}></PostView>
    </PostContext>
  );
};

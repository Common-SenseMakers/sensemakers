import { useParams } from 'react-router-dom';

import { UserPostsContext, useUserPosts } from '../user-home/UserPostsContext';
import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { id } = useParams();
  const { posts } = useUserPosts();

  const currPostIndex = posts?.findIndex((p) => p.id === id);
  const prevPostId =
    posts && currPostIndex && currPostIndex > 0
      ? posts[currPostIndex - 1].id
      : undefined;

  const nextPostId =
    posts && currPostIndex && currPostIndex < posts.length - 1
      ? posts[currPostIndex + 1].id
      : undefined;

  return (
    <UserPostsContext>
      <PostContext postId={id}>
        <PostView prevPostId={prevPostId} nextPostId={nextPostId}></PostView>
      </PostContext>
    </UserPostsContext>
  );
};

import { useParams } from 'react-router-dom';

import { UserPostsContext } from '../user-home/UserPostsContext';
import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { id } = useParams();
  return (
    <UserPostsContext>
      <PostContext postId={id}>
        <PostView></PostView>
      </PostContext>
    </UserPostsContext>
  );
};

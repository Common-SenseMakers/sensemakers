import { useParams } from 'react-router-dom';

import { PostContext } from './PostContext';
import { PostView } from './PostView';

/** extract the postId from the route and pass it to a PostContext */
export const PostPage = () => {
  const { id } = useParams();
  return (
    <PostContext postId={id}>
      <PostView></PostView>
    </PostContext>
  );
};

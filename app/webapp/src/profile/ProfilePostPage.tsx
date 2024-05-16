import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { PostContext } from '../post/PostContext';
import { PostView } from '../post/PostView';
import { useProfileContext } from './ProfileContext';

/** extract the postId from the route and pass it to a PostContext */
export const ProfilePostPage = () => {
  const { postId } = useParams();
  const { profile } = useProfileContext();

  return (
    <PostContext postId={postId}>
      <PostView profile={profile} isProfile></PostView>
    </PostContext>
  );
};

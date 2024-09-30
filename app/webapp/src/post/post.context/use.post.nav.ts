import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AbsoluteRoutes } from '../../route.names';
import { useUserPosts } from '../../user-home/UserPostsContext';
import { PostFetchContext } from './use.post.fetch';

export interface PostNavContext {
  prevPostId?: string;
  nextPostId?: string;
  openNextPost: () => void;
}

export const usePostNav = (fetched: PostFetchContext): PostNavContext => {
  const navigate = useNavigate();
  const { feed } = useUserPosts();

  const { prevPostId, nextPostId } = useMemo(
    () => feed.getNextAndPrev(fetched.postId),
    [fetched.post]
  );

  const openNextPost = () => {
    if (nextPostId) {
      navigate(AbsoluteRoutes.Post(nextPostId));
    }
  };

  return { prevPostId, nextPostId, openNextPost };
};

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AbsoluteRoutes } from '../route.names';
import { useUserPosts } from '../user-home/UserPostsContext';
import { PostFetchContext } from './use.current.post';

export interface PostNavContext {
  prevPostId?: string;
  nextPostId?: string;
  openNextPost: () => void;
}

export const usePostNav = (fetched: PostFetchContext): PostNavContext => {
  const navigate = useNavigate();
  const { getNextAndPrev } = useUserPosts();

  const { prevPostId, nextPostId } = useMemo(
    () => getNextAndPrev(fetched.postId),
    [fetched.post]
  );

  const openNextPost = () => {
    if (nextPostId) {
      navigate(AbsoluteRoutes.Post(nextPostId));
    }
  };

  return { prevPostId, nextPostId, openNextPost };
};

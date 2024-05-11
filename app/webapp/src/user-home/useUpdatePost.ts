import { useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PostUpdate } from '../shared/types/types.posts';

const DEBUG = true;
export const usePostUpdate = () => {
  const appFetch = useAppFetch();
  const [updatingPosts, setUpdatingPosts] = useState<string[]>([]);

  const updatePost = async (postId: string, postUpdate: PostUpdate) => {
    if (DEBUG) console.log(`updatePost called`, { postId, postUpdate });
    setUpdatingPosts((prev) => [...prev, postId]);

    try {
      await appFetch<
        void,
        {
          postId: string;
          postUpdate: PostUpdate;
        }
      >('/api/posts/update', {
        postId,
        postUpdate,
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Error updating post ${postId}`);
    }
    setUpdatingPosts((prev) => prev.filter((id) => id !== postId));
  };

  const isPostUpdating = (postId: string) => {
    return updatingPosts.includes(postId);
  };

  return { updatePost, isPostUpdating };
};

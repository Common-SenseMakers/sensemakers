import { useCallback, useState } from 'react';
import { useAppFetch } from '../../api/app.fetch';
import { useToastContext } from '../../app/ToastsContext';
import { useUserPosts } from '../../user-home/UserPostsContext';
import { ConnectedUser } from '../../user-login/contexts/AccountContext';
import { PostFetchContext } from './use.post.fetch';

export interface PostDeleteContext {
  isDeleting: boolean;
  deletePost: () => Promise<void>;
}

export const usePostDelete = (
  fetched: PostFetchContext,
  connectedUser?: ConnectedUser
): PostDeleteContext => {
  const { show } = useToastContext();
  const appFetch = useAppFetch();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { feed } = useUserPosts();
  const { removePost } = feed;

  const deletePost = useCallback(async () => {
    if (!fetched.post || !fetched.postId) {
      return;
    }

    // Check if user has permission to delete
    if (connectedUser?.userId !== fetched.post.authorUserId) {
      show({ 
        title: 'Permission denied', 
        message: 'You can only delete your own posts' 
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Optimistically remove from local state
      removePost(fetched.postId);

      // Make API call
      await appFetch<void, { postId: string }>('/api/posts/delete', {
        postId: fetched.postId
      });

      show({ 
        title: 'Success', 
        message: 'Post deleted successfully' 
      });
    } catch (e) {
      console.error(e);
      show({ 
        title: 'Error deleting post', 
        message: (e as Error).message 
      });
      // Could add logic here to restore the post in local state if API call fails
    } finally {
      setIsDeleting(false);
    }
  }, [appFetch, fetched.post, fetched.postId, connectedUser, show, removePost]);

  return {
    isDeleting,
    deletePost
  };
};

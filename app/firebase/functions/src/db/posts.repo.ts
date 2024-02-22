import { AppPost, AppPostStore } from '../@shared/types';
import { collections } from '../db/db';

export const createPost = async (post: AppPostStore): Promise<AppPost> => {
  const ref = collections.posts.doc();
  await ref.create(post);
  return { id: ref.id, ...post };
};

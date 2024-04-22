import { doc, onSnapshot } from 'firebase/firestore';

import { AppPost } from '../shared/types/types.posts';
import { collections } from './config';

export const postSubscribe = (
  postId: string,
  callback: (post: AppPost) => void
) => {
  const postRef = doc(collections.post(postId));
  return onSnapshot(postRef, (doc): void => {
    callback({ id: postRef.id, ...doc.data() } as AppPost);
  });
};

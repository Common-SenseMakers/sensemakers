import { doc, onSnapshot } from 'firebase/firestore';

import { AppPost, AppPostFull } from '../shared/types/types.posts';
import { collections } from './config';

export const subscribeToPost = (
  postId: string,
  callback: (post: AppPostFull) => void
) => {
  const postRef = doc(collections.post(postId));
  return onSnapshot(postRef, (doc): void => {
    callback({ id: postRef.id, ...doc.data() } as AppPostFull);
  });
};

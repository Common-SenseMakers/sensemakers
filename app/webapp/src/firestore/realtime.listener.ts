import { doc, onSnapshot } from 'firebase/firestore';

import { AppPost, AppPostFull } from '../shared/types/types.posts';
import { collections } from './config';

export const subscribeToPost = (
  postId: string,
  callback: (post: AppPostFull) => void
) => {
  const postDoc = collections.post(postId);
  return onSnapshot(postDoc, (doc): void => {
    console.log('onSnapshot', { doc });
    const post = doc.data();
    callback({ id: postDoc.id, ...post } as AppPostFull);
  });
};

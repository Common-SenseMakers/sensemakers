import { doc, onSnapshot } from 'firebase/firestore';

import { AppPost, AppPostFull } from '../shared/types/types.posts';
import { collections } from './config';

export const subscribeToPost = (postId: string, callback: () => void) => {
  const postDoc = collections.post(postId);
  return onSnapshot(postDoc, (doc): void => {
    console.log('onSnapshot - postId', { postId, doc });
    const post = doc.data();
    callback();
  });
};

export const subscribeToPlatformPost = (
  platformPostId: string,
  callback: () => void
) => {
  const doc = collections.platformPost(platformPostId);
  return onSnapshot(doc, (doc): void => {
    console.log('onSnapshot - platformPostId', { platformPostId, doc });
    callback();
  });
};

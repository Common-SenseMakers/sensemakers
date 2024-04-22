import { doc, onSnapshot } from 'firebase/firestore';

import db from '../firebase/config';
import { AppPost } from '../shared/types/types.posts';
import { CollectionNames } from '../shared/utils/collectionNames';

export const subscribeToPost = (
  postId: string,
  callback: (post: AppPost) => void
) => {
  const postRef = doc(db, CollectionNames.Posts, postId);
  return onSnapshot(postRef, (doc) => {
    if (doc.exists()) {
      const post = { ...(doc.data() as AppPost), id: doc.id };
      callback(post);
    }
  });
};

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/collectionNames';

initializeApp();

export const db = getFirestore();

export const collections = {
  users: db.collection(CollectionNames.Users),
  posts: db.collection(CollectionNames.Posts),
};

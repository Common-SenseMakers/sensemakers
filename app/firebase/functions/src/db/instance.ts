import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/collectionNames';

initializeApp();

export const db = getFirestore();

export const collections = {
  users: db.collection(CollectionNames.Users),
  posts: db.collection(CollectionNames.Posts),
};

export class DBInstance {
  protected firestore: Firestore;

  public collections: {
    users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    posts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  };

  constructor() {
    this.firestore = getFirestore();
    this.collections = {
      users: this.firestore.collection(CollectionNames.Users),
      posts: this.firestore.collection(CollectionNames.Posts),
    };
  }
}

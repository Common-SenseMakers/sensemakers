import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/collectionNames';

initializeApp();

export const db = getFirestore();

export class DBInstance {
  protected firestore: Firestore;

  public collections: {
    signup: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    posts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  };

  constructor() {
    this.firestore = getFirestore();
    this.collections = {
      signup: this.firestore.collection(CollectionNames.Signup),
      users: this.firestore.collection(CollectionNames.Users),
      posts: this.firestore.collection(CollectionNames.Posts),
    };
  }

  get batch() {
    return this.firestore.batch();
  }
}

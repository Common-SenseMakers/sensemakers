import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import db from '../firebase/config';
import { AppPost } from '../shared/types/types.posts';
import { CollectionNames } from '../shared/utils/collectionNames';

class FirestoreService {
  public db: Firestore;
  constructor(db: Firestore) {
    this.db = db;
  }

  async getUserPosts(userId: string): Promise<AppPost[]> {
    const postsRef = query(
      collection(this.db, CollectionNames.Posts),
      where('authorId', '==', userId)
    );
    const snapshot = await getDocs(postsRef);
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as AppPost),
      id: doc.id,
    }));
  }
}

export default FirestoreService;
export const firestoreService = new FirestoreService(db);

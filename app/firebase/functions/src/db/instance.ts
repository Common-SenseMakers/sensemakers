import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/utils/collectionNames';
import {
  HandleWithTransactionManager,
  ManagerConfig,
  ManagerModes,
  TransactionManager,
} from './transaction.manager';

initializeApp();

export class DBInstance {
  protected firestore: Firestore;

  public collections: {
    signup: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    posts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    platformPosts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  };

  constructor() {
    this.firestore = getFirestore();
    this.collections = {
      signup: this.firestore.collection(CollectionNames.Signup),
      users: this.firestore.collection(CollectionNames.Users),
      posts: this.firestore.collection(CollectionNames.Posts),
      platformPosts: this.firestore.collection(CollectionNames.PlatformPosts),
    };
  }

  /** a wrapper of TransactionManager to instantiate and applyWrites automatically */
  async runWithTransactionManager<P, R>(
    func: HandleWithTransactionManager<P, R>,
    payload: P,
    config: ManagerConfig = { mode: ManagerModes.TRANSACTION }
  ): Promise<R> {
    switch (config.mode) {
      case ManagerModes.TRANSACTION:
        return this.firestore.runTransaction(async (transaction) => {
          const manager = new TransactionManager(transaction);

          const result = await func(payload, manager);

          await manager.applyWrites();

          return result;
        });

      case ManagerModes.BATCH: {
        const batch = this.firestore.batch();
        const manager = new TransactionManager(undefined, batch);

        const result = await func(payload, manager);

        await manager.applyWrites();

        return result;
      }
    }
  }
}

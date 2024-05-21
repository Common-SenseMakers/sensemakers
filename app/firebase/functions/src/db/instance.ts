import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/utils/collectionNames';
import { IS_EMULATOR } from '../config/config.runtime';
import { logger } from '../instances/logger';
// import { SERVICE_ACCOUNT_ID } from '../config/config.runtime';
import {
  HandleWithTxManager,
  ManagerConfig,
  ManagerModes,
  TransactionManager,
} from './transaction.manager';

export const app = IS_EMULATOR
  ? initializeApp({
      projectId: 'demo-sensenets',
    })
  : initializeApp();

const DEBUG = false;

export class DBInstance {
  public firestore: Firestore;

  public collections: {
    signup: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    posts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    platformPosts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    updates: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    profiles: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    triples: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  };

  constructor() {
    this.firestore = getFirestore();

    this.collections = {
      signup: this.firestore.collection(CollectionNames.Signup),
      users: this.firestore.collection(CollectionNames.Users),
      posts: this.firestore.collection(CollectionNames.Posts),
      platformPosts: this.firestore.collection(CollectionNames.PlatformPosts),
      updates: this.firestore.collection(CollectionNames.Updates),
      profiles: this.firestore.collection(CollectionNames.Profiles),
      triples: this.firestore.collection(CollectionNames.Triples),
    };
  }

  /** a wrapper of TransactionManager to instantiate and applyWrites automatically */
  async run<R, P>(
    func: HandleWithTxManager<R, P>,
    payload?: P,
    config: ManagerConfig = { mode: ManagerModes.TRANSACTION }
  ): Promise<R> {
    switch (config.mode) {
      case ManagerModes.TRANSACTION:
        return this.firestore.runTransaction(async (transaction) => {
          if (DEBUG) logger.debug('Transaction started');
          const manager = new TransactionManager(transaction);
          
          const result = await func(manager, payload);
          if (DEBUG) logger.debug('Transaction function executed');
          
          await manager.applyWrites();
          if (DEBUG) logger.debug('Transaction writes applied');
          return result;
        });

      case ManagerModes.BATCH: {
        const batch = this.firestore.batch();
        const manager = new TransactionManager(undefined, batch);
        const result = await func(manager, payload);
        await manager.applyWrites();
        return result;
      }
    }
  }
}

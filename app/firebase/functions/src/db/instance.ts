import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/utils/collectionNames';
import { IS_EMULATOR } from '../config/config.runtime';
import { logger } from '../instances/logger';
import {
  HandleWithTxManager,
  ManagerConfig,
  ManagerModes,
  TransactionManager,
} from './transaction.manager';

dotenv.config({ path: './scripts/.script.env' });

export const app = (() => {
  if (IS_EMULATOR) {
    return initializeApp({
      projectId: 'demo-sensenets',
    });
  }

  /** used locally to run scripts connected to a given project */
  if (process.env.FB_CERT_PATH) {
    const serviceAccount = require('../../' + process.env.FB_CERT_PATH);

    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FB_PROJECT_ID,
    });
  }
  /** used on deployment with the current app */
  return initializeApp();
})();

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
    activity: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    userNotifications: (
      userId: string
    ) => FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
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
      activity: this.firestore.collection(CollectionNames.Activity),
      userNotifications: (userId: string) =>
        this.firestore
          .collection(CollectionNames.Users)
          .doc(userId)
          .collection(CollectionNames.Notifications),
    };
  }

  /** a wrapper of TransactionManager to instantiate and applyWrites automatically */
  async run<R, P>(
    func: HandleWithTxManager<R, P>,
    payload?: P,
    config: ManagerConfig = { mode: ManagerModes.TRANSACTION },
    debugId: string = ''
  ): Promise<R> {
    switch (config.mode) {
      case ManagerModes.TRANSACTION:
        const result = await this.firestore.runTransaction(
          async (transaction) => {
            if (DEBUG) logger.debug(`Transaction started ${debugId}`);
            try {
              const manager = new TransactionManager(transaction);

              const result = await func(manager, payload);
              if (DEBUG)
                logger.debug(
                  `Transaction function ran ${debugId} (writes not applied)`,
                  {
                    result,
                  }
                );

              await manager.applyWrites();

              if (DEBUG) logger.debug(`Transaction writes applied ${debugId}`);

              return result;
            } catch (error: any) {
              logger.error(`Transaction failed ${debugId}`, error);
              throw new Error(error);
            }
          }
        );
        if (DEBUG)
          logger.debug(`Transaction fully executed ${debugId}`, { result });
        return result;

      case ManagerModes.BATCH: {
        try {
          const batch = this.firestore.batch();
          const manager = new TransactionManager(undefined, batch);
          const result = await func(manager, payload);
          await manager.applyWrites();
          return result;
        } catch (error: any) {
          logger.error('Transaction failed', error);
          throw new Error(error);
        }
      }
    }
  }
}

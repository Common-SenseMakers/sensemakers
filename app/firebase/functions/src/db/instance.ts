import { Firestore } from 'firebase-admin/firestore';

import { CollectionNames } from '../@shared/utils/collectionNames';
import { logger } from '../instances/logger';
import {
  HandleWithTxManager,
  ManagerConfig,
  ManagerModes,
  TransactionManager,
} from './transaction.manager';

const DEBUG = false;

export type Query = FirebaseFirestore.Query<
  FirebaseFirestore.DocumentData,
  FirebaseFirestore.DocumentData
>;

export class DBInstance {
  public firestore: Firestore;

  public collections: {
    signup: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    users: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    posts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    platformPosts: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    updates: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    profiles: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    activity: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    links: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    linkPosts: (
      linkId: string
    ) => FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    keywords: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    keywordPosts: (
      keywordId: string
    ) => FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  };

  constructor(firestore: Firestore) {
    if (DEBUG) logger.debug('Creating DBInstance');
    this.firestore = firestore;

    this.collections = {
      signup: this.firestore.collection(CollectionNames.Signup),
      users: this.firestore.collection(CollectionNames.Users),
      posts: this.firestore.collection(CollectionNames.Posts),
      platformPosts: this.firestore.collection(CollectionNames.PlatformPosts),
      updates: this.firestore.collection(CollectionNames.Updates),
      profiles: this.firestore.collection(CollectionNames.Profiles),
      activity: this.firestore.collection(CollectionNames.Activity),
      links: this.firestore.collection(CollectionNames.Links),
      linkPosts: (linkId: string) =>
        this.firestore
          .collection(CollectionNames.Links)
          .doc(linkId)
          .collection(CollectionNames.LinkPostsSubcollection),
      keywords: this.firestore.collection(CollectionNames.Keywords),
      keywordPosts: (linkId: string) =>
        this.firestore
          .collection(CollectionNames.Keywords)
          .doc(linkId)
          .collection(CollectionNames.KeywordPostsSubcollection),
    };
  }

  /** a wrapper of TransactionManager to instantiate and applyWrites automatically */
  async run<R, P>(
    func: HandleWithTxManager<R, P>,
    payload?: P,
    config: ManagerConfig = { mode: ManagerModes.TRANSACTION },
    debugId: string = '',
    DEBUG: boolean = false
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

  /** WARNING!!! clear all collections */
  async clear() {
    const collections = await this.firestore.listCollections();
    await Promise.all(
      collections.map(async (collection) => {
        return this.firestore.recursiveDelete(collection);
      })
    );
  }
}

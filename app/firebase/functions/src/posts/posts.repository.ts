import { FieldValue } from 'firebase-admin/firestore';
import { TransactionManager } from 'src/db/transaction.manager';

import {
  AppPost,
  AppPostCreate,
  PostUpdate,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

export class PostsRepository extends BaseRepository<AppPost, AppPostCreate> {
  constructor(protected db: DBInstance) {
    super(db.collections.posts);
  }

  public async updateContent(
    postId: string,
    postUpdate: PostUpdate,
    manager: TransactionManager,
    checkExists = false
  ) {
    if (checkExists) {
      const doc = await this.getDoc(postId, manager);
      if (!doc.exists) throw new Error(`Post ${postId} not found`);
    }

    const ref = this.getRef(postId);
    manager.update(ref, postUpdate);
  }

  public async addMirror(
    postId: string,
    mirrorId: string,
    manager: TransactionManager
  ) {
    const ref = this.getRef(postId);
    manager.update(ref, { mirrorsIds: FieldValue.arrayUnion(mirrorId) });
  }

  /** Cannot be part of a transaction */
  public async getPendingOfUser(userId: string) {
    const posts = await this.db.collections.posts
      .where('authorId', '==', userId)
      .where('reviewedStatus', '==', 'pending')
      .get();

    return posts.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppPost[];
  }
}

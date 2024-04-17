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
    postUpdate: PostUpdate,
    manager: TransactionManager
  ) {
    const doc = await this.getDoc(postUpdate.id, manager);
    if (!doc.exists) throw new Error(`Post ${postUpdate.id} not found`);

    const post = doc.data() as AppPost;

    /** for safety support only some properties update */
    post.content = postUpdate.content;
    post.semantics = postUpdate.semantics;

    await manager.set(doc.ref, post, { merge: true });
  }

  public async addMirror(
    postId: string,
    mirrorId: string,
    manager: TransactionManager
  ) {
    const ref = this.getRef(postId);

    /** for safety support only some properties update */
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

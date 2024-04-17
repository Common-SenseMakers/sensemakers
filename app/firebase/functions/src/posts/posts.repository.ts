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

  public async updatePostContent(
    postUpdate: PostUpdate,
    manager: TransactionManager
  ) {
    const doc = await this.getDoc(postUpdate.id, manager, true);
    const post = doc.data() as AppPost;

    /** for safety support only some properties update */
    post.content = postUpdate.content;
    post.semantics = postUpdate.semantics;

    await doc.ref.set(post, { merge: true });
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

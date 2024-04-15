import { TransactionManager } from 'src/db/transaction.manager';

import { DefinedIfTrue } from '../@shared/types/types';
import {
  AppPost,
  AppPostCreate,
  PostUpdate,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';

export class PostsRepository {
  constructor(protected db: DBInstance) {}

  public create(post: AppPostCreate, manager: TransactionManager): AppPost {
    const postRef = this.db.collections.posts.doc();
    manager.set(postRef, post);

    return {
      id: postRef.id,
      ...post,
    };
  }

  protected async getPostRef(postId: string, shouldThrow: boolean = false) {
    const ref = this.db.collections.posts.doc(postId);
    if (shouldThrow) {
      const doc = await this.getPostDoc(postId);

      if (!doc.exists) {
        throw new Error(`Post ${postId} not found`);
      }
    }

    return ref;
  }

  protected async getPostDoc(userId: string, shouldThrow: boolean = false) {
    const ref = await this.getPostRef(userId, shouldThrow);
    return ref.get();
  }

  public async get<T extends boolean, R = AppPost>(
    id: string,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const doc = await this.getPostDoc(id);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
      if (_shouldThrow) throw new Error(`AppPost ${id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    return {
      id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }

  public async updatePostContent(postUpdate: PostUpdate) {
    const doc = await this.getPostDoc(postUpdate.id, true);
    const post = doc.data() as AppPost;

    /** for safety support only some properties update */
    post.content = postUpdate.content;
    post.semantics = postUpdate.semantics;

    await doc.ref.set(post, { merge: true });
  }
}

import { DefinedIfTrue } from '../@shared/types/types';
import {
  PlatformPost,
  PlatformPostCreate,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';

export class PlatformPostsRepository {
  constructor(protected db: DBInstance) {}

  public create(
    post: PlatformPostCreate,
    manager: TransactionManager
  ): PlatformPost {
    const postRef = this.db.collections.platformPosts.doc();
    manager.set(postRef, post);

    return {
      id: postRef.id,
      ...post,
    };
  }

  public async getFromPostId<T extends boolean, R = PlatformPost>(
    post_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    const posts = await manager.query(
      this.db.collections.platformPosts.where('posted.post_id', '==', post_id)
    );

    if (posts.empty) {
      if (_shouldThrow) throw new Error(`User ${post_id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    const doc = posts.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }

  protected async getRef(postId: string, shouldThrow: boolean = false) {
    const ref = this.db.collections.platformPosts.doc(postId);
    if (shouldThrow) {
      const doc = await this.getDoc(postId);

      if (!doc.exists) {
        throw new Error(`Post ${postId} not found`);
      }
    }

    return ref;
  }

  protected async getDoc(userId: string, shouldThrow: boolean = false) {
    const ref = await this.getRef(userId, shouldThrow);
    return ref.get();
  }

  public async get<T extends boolean, R = PlatformPost>(
    id: string,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const doc = await this.getDoc(id);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
      if (_shouldThrow) throw new Error(`PlatformPost ${id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    return {
      id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }
}

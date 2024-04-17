import { DefinedIfTrue } from '../@shared/types/types';
import {
  PlatformPost,
  PlatformPostCreate,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class PlatformPostsRepository extends BaseRepository<
  PlatformPost,
  PlatformPostCreate
> {
  constructor(protected db: DBInstance) {
    super(db.collections.platformPosts);
  }

  /** Get the platform post from the published post_id */
  public async getFrom_post_id<T extends boolean, R = PlatformPost>(
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
}

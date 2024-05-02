import { DefinedIfTrue } from '../@shared/types/types';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostUpdatePosted,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';

const DEBUG = true;

export class PlatformPostsRepository extends BaseRepository<
  PlatformPost,
  PlatformPostCreate
> {
  constructor(protected db: DBInstance) {
    super(db.collections.platformPosts);
  }

  private triggerUpdate(platformPostId: string, manager: TransactionManager) {
    if (DEBUG) logger.debug(`triggerUpdate platformPostId-${platformPostId}`);
    const updateRef = this.db.collections.updates.doc(
      `platformPost-${platformPostId}`
    );
    manager.set(updateRef, Date.now());
  }

  public async updatePosted(
    postId: string,
    postUpdate: PlatformPostUpdatePosted,
    manager: TransactionManager,
    checkExists = false
  ) {
    if (checkExists) {
      const doc = await this.getDoc(postId, manager);
      if (!doc.exists) throw new Error(`Post ${postId} not found`);
    }

    const ref = this.getRef(postId);
    manager.update(ref, postUpdate);
    this.triggerUpdate(ref.id, manager);
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

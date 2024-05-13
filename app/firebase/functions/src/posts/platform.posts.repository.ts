import { DefinedIfTrue, PLATFORM } from '../@shared/types/types';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostPosted,
  PlatformPostUpdatePosted,
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

  /** Get the platform post from platform, account and the AppPost id */
  public async getFromPostId<T extends boolean, R = PlatformPost>(
    postId: string,
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;
    const postIdKey: keyof PlatformPost = 'postId';
    const postedKey: keyof PlatformPost = 'posted';
    const user_idKey: keyof PlatformPostPosted = 'user_id';
    const platformKey: keyof PlatformPost = 'platformId';

    const posts = await manager.query(
      this.db.collections.platformPosts
        .where(postIdKey, '==', postId)
        .where(platformKey, '==', platform)
        .where(`${postedKey}.${user_idKey}`, '==', user_id)
    );

    if (posts.empty) {
      if (_shouldThrow)
        throw new Error(
          `Platform post for postId:${postId} and platform:${platform} and user_id:${user_id} not found`
        );
      else return undefined as DefinedIfTrue<T, R>;
    }

    const doc = posts.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }

  public setPostId(
    post_id: string,
    postId: string,
    manager: TransactionManager
  ) {
    const ref = this.getRef(post_id);
    manager.update(ref, { postId });
  }

  public async updatePosted(
    post_id: string,
    postUpdate: PlatformPostUpdatePosted,
    manager: TransactionManager,
    checkExists = false
  ) {
    if (checkExists) {
      const doc = await this.getDoc(post_id, manager);
      if (!doc.exists) throw new Error(`Post ${post_id} not found`);
    }

    const ref = this.getRef(post_id);
    manager.update(ref, postUpdate);
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

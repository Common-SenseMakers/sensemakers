import { FieldValue } from 'firebase-admin/firestore';

import {
  AppPost,
  AppPostCreate,
  PostUpdate,
  UserPostsQueryParams,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

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
  public async getOfUser(userId: string, queryParams?: UserPostsQueryParams) {
    /** type protection agains properties renaming */
    const createdAtKey: keyof AppPost = 'createdAtMs';
    const authorKey: keyof AppPost = 'authorId';

    let query = this.db.collections.posts
      .where(authorKey, '==', userId)
      .orderBy(createdAtKey, 'desc');

    /** perform query filtering at the level of AppPost */
    switch (queryParams?.status) {
      case 'published':
        query = query.where('reviewedStatus', '==', 'reviewed');
        break;
      case 'ignored':
        query = query.where('parsedStatus', '==', 'processed');
        break;
      case 'for review':
        query = query.where('reviewedStatus', '==', 'pending');
        break;
      case 'all':
      default:
        break;
    }

    const posts = await query.get();

    return posts.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppPost[];
  }

  /** Cannot be part of a transaction */
  public async getNonParsedOfUser(userId: string): Promise<string[]> {
    /** type protection agains properties renaming */
    const statusKey: keyof AppPost = 'parsedStatus';
    const authorKey: keyof AppPost = 'authorId';

    const statusValue: AppPost['parsedStatus'] = 'unprocessed';

    const posts = await this.db.collections.posts
      .where(statusKey, '==', statusValue)
      .where(authorKey, '==', userId)
      .get();

    return posts.docs.map((doc) => doc.id) as string[];
  }
}

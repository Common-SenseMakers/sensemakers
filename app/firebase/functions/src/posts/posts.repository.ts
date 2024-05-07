import { FieldValue } from 'firebase-admin/firestore';

import {
  AppPost,
  AppPostCreate,
  AppPostParsedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatusParam,
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
    const reviewedStatusKey: keyof AppPost = 'reviewedStatus';
    const parsedStatusKey: keyof AppPost = 'parsedStatus';

    let query = this.db.collections.posts
      .where(authorKey, '==', userId)
      .orderBy(createdAtKey, 'desc');

    /** perform query filtering at the level of AppPost */
    switch (queryParams?.status) {
      case PostsQueryStatusParam.PUBLISHED:
        query = query.where(
          reviewedStatusKey,
          '==',
          AppPostReviewStatus.REVIEWED
        );
        break;
      case PostsQueryStatusParam.IGNORED:
        query = query.where(
          parsedStatusKey,
          '==',
          AppPostParsedStatus.PROCESSED
        );
        break;
      case PostsQueryStatusParam.PENDING:
        query = query.where(
          reviewedStatusKey,
          '==',
          AppPostReviewStatus.PENDING
        );
        break;
      case PostsQueryStatusParam.ALL:
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

    const statusValue: AppPostParsedStatus = AppPostParsedStatus.UNPROCESSED;

    const posts = await this.db.collections.posts
      .where(statusKey, '==', statusValue)
      .where(authorKey, '==', userId)
      .get();

    return posts.docs.map((doc) => doc.id) as string[];
  }
}

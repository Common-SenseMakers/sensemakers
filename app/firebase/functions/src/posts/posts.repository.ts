import { FieldValue } from 'firebase-admin/firestore';

import {
  AppPost,
  AppPostCreate,
  AppPostParsedStatus,
  AppPostRepublishedStatus,
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
    const republishedStatusKey: keyof AppPost = 'republishedStatus';

    /** status
     * ALL: all posts
     * PENDING: ReviewStatus.PENDING
     */

    const baseQuery = this.db.collections.posts.where(authorKey, '==', userId);

    const filteredQuery = (() => {
      if (queryParams) {
        if (queryParams.status === PostsQueryStatusParam.ALL) {
          return baseQuery;
        }
        if (queryParams.status === PostsQueryStatusParam.PENDING) {
          return baseQuery.where(
            reviewedStatusKey,
            '==',
            AppPostReviewStatus.PENDING
          );
        }
        if (queryParams.status === PostsQueryStatusParam.PUBLISHED) {
          return baseQuery.where(
            republishedStatusKey,
            '==',
            AppPostRepublishedStatus.REPUBLISHED
          );
        }
        return baseQuery;
      } else {
        return baseQuery;
      }
    })();

    const finalQuery = filteredQuery.orderBy(createdAtKey, 'desc');

    const posts = await finalQuery.get();

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

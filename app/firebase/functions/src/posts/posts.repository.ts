import { FieldValue } from 'firebase-admin/firestore';

import {
  AppPost,
  AppPostCreate,
  AppPostParsedStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatus,
  UserPostsQuery,
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
  public async getOfUser(userId: string, queryParams: UserPostsQuery) {
    /** type protection agains properties renaming */
    const createdAtKey: keyof AppPost = 'createdAtMs';
    const authorKey: keyof AppPost = 'authorId';
    const reviewedStatusKey: keyof AppPost = 'reviewedStatus';
    const republishedStatusKey: keyof AppPost = 'republishedStatus';

    const base = this.db.collections.posts.where(authorKey, '==', userId);

    const filtered = (() => {
      if (queryParams.status === PostsQueryStatus.ALL) {
        return base;
      }
      if (queryParams.status === PostsQueryStatus.PENDING) {
        return base.where(reviewedStatusKey, '==', AppPostReviewStatus.PENDING);
      }
      if (queryParams.status === PostsQueryStatus.PUBLISHED) {
        return base.where(
          republishedStatusKey,
          '==',
          AppPostRepublishedStatus.REPUBLISHED
        );
      }
      if (queryParams.status === PostsQueryStatus.IGNORED) {
        return base.where(reviewedStatusKey, '==', AppPostReviewStatus.IGNORED);
      }
      return base;
    })();

    /** get the sinceCreatedAt and untilCreatedAt timestamps from the elements ids */
    const { sinceCreatedAt, untilCreatedAt } = await (async () => {
      return this.db.run(async (manager) => {
        let sinceCreatedAt: number | undefined;
        let untilCreatedAt: number | undefined;

        if (queryParams.fetchParams.sinceId) {
          const since = await this.get(
            queryParams.fetchParams.sinceId,
            manager
          );
          sinceCreatedAt = since ? since.createdAtMs : undefined;
        }

        if (queryParams.fetchParams.untilId) {
          const until = await this.get(
            queryParams.fetchParams.untilId,
            manager
          );
          untilCreatedAt = until ? until.createdAtMs : undefined;
        }

        return { sinceCreatedAt, untilCreatedAt };
      });
    })();

    /** two modes, forward sinceId or backwards untilId  */
    const paginated = await (async () => {
      if (sinceCreatedAt) {
        const ordered = filtered.orderBy(createdAtKey, 'asc');
        return ordered.startAfter(sinceCreatedAt);
      } else {
        const ordered = filtered.orderBy(createdAtKey, 'desc');
        return untilCreatedAt ? ordered.startAfter(untilCreatedAt) : ordered;
      }
    })();

    const posts = await paginated
      .limit(queryParams.fetchParams.expectedAmount)
      .get();

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

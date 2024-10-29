import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';

import { StructuredSemantics } from '../@shared/types/types.parser';
import {
  AppPost,
  AppPostCreate,
  AppPostParsedStatus,
  PostUpdate,
  PostsQueryDefined,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

const DEBUG = true;
const DEBUG_PREFIX = 'PostsRepository';

type Query = FirebaseFirestore.Query<
  FirebaseFirestore.DocumentData,
  FirebaseFirestore.DocumentData
>;
export class PostsRepository extends BaseRepository<AppPost, AppPostCreate> {
  constructor(protected db: DBInstance) {
    super(db.collections.posts, db);
  }

  public async update(
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
    manager.update(ref, removeUndefined(postUpdate));
  }

  public addMirror(
    postId: string,
    mirrorId: string,
    manager: TransactionManager
  ) {
    const ref = this.getRef(postId);
    manager.update(ref, { mirrorsIds: FieldValue.arrayUnion(mirrorId) });
  }

  /** Cannot be part of a transaction */
  public async getMany(queryParams: PostsQueryDefined) {
    /** type protection agains properties renaming */
    const createdAtKey: keyof AppPost = 'createdAtMs';
    const authorUserKey: keyof AppPost = 'authorUserId';
    const authorProfileKey: keyof AppPost = 'authorProfileId';
    const originKey: keyof AppPost = 'origin';

    const structuredSemanticsKey: keyof AppPost = 'structuredSemantics';
    const keywordsKey: keyof StructuredSemantics = 'keywords';
    const labelsKey: keyof StructuredSemantics = 'labels';
    const topicsKey: keyof StructuredSemantics = 'topics';

    if (DEBUG) logger.debug('getMany', queryParams, DEBUG_PREFIX);

    let cumulativeQuery = ((_base: Query) => {
      if (queryParams.userId) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by userId',
            queryParams.userId,
            DEBUG_PREFIX
          );

        return _base.where(authorUserKey, '==', queryParams.userId);
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - dont filter by userId',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(this.db.collections.posts);

    cumulativeQuery = ((_base: Query) => {
      if (queryParams.origins && queryParams.origins.length > 0) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by origin',
            queryParams.origins,
            DEBUG_PREFIX
          );

        return _base.where(originKey, 'in', queryParams.origins);
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - dont filter by origin',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(cumulativeQuery);

    cumulativeQuery = ((_base: Query) => {
      if (queryParams.profileIds && queryParams.profileIds.length > 0) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by profileIds',
            queryParams.profileIds,
            DEBUG_PREFIX
          );

        return _base.where(authorProfileKey, 'in', queryParams.profileIds);
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - dont filter by profilesIds',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(cumulativeQuery);

    if (DEBUG) logger.debug('getOfUser', queryParams, DEBUG_PREFIX);

    cumulativeQuery = ((_base: Query) => {
      if (
        queryParams.semantics?.topics &&
        queryParams.semantics?.topics.length > 0
      ) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by labels',
            JSON.stringify(queryParams.semantics.topics),
            DEBUG_PREFIX
          );

        return _base.where(
          `${structuredSemanticsKey}.${topicsKey}`,
          'array-contains-any',
          queryParams.semantics.topics
        );
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - filter by topics skipped',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(cumulativeQuery);

    cumulativeQuery = ((_base: Query) => {
      if (
        queryParams.semantics?.labels &&
        queryParams.semantics?.labels.length > 0
      ) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by labels',
            JSON.stringify(queryParams.semantics.labels),
            DEBUG_PREFIX
          );

        return _base.where(
          `${structuredSemanticsKey}.${labelsKey}`,
          'array-contains-any',
          queryParams.semantics.labels
        );
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - filter by labels skipped',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(cumulativeQuery);

    cumulativeQuery = ((_base: Query) => {
      if (
        queryParams.semantics?.keywords &&
        queryParams.semantics?.keywords.length > 0
      ) {
        if (DEBUG)
          logger.debug(
            'getMany - filter by keywords',
            JSON.stringify(queryParams.semantics.keywords),
            DEBUG_PREFIX
          );

        return _base.where(
          `${structuredSemanticsKey}.${keywordsKey}`,
          'array-contains-any',
          queryParams.semantics.keywords
        );
      } else {
        if (DEBUG)
          logger.debug(
            'getMany - filter by keywords skipped',
            undefined,
            DEBUG_PREFIX
          );

        return _base;
      }
    })(cumulativeQuery);

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
    const paginated = await (async (_base: Query) => {
      if (sinceCreatedAt) {
        const ordered = _base.orderBy(createdAtKey, 'asc');
        return ordered.startAfter(sinceCreatedAt);
      } else {
        const ordered = _base.orderBy(createdAtKey, 'desc');
        return untilCreatedAt ? ordered.startAfter(untilCreatedAt) : ordered;
      }
    })(cumulativeQuery);

    const posts = await paginated
      .limit(queryParams.fetchParams.expectedAmount)
      .get();

    const appPosts = posts.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppPost[];

    return appPosts.sort((a, b) => b.createdAtMs - a.createdAtMs);
  }

  public async getAllOfQuery(queryParams: PostsQueryDefined, limit?: number) {
    let stillPending = true;
    const allPosts: AppPost[] = [];

    while (stillPending) {
      if (DEBUG) logger.debug('getAllOfQuery', queryParams, DEBUG_PREFIX);
      const posts = await this.getMany(queryParams);

      stillPending = posts.length === queryParams.fetchParams.expectedAmount;

      if (DEBUG)
        logger.debug(
          `getAllOfQuery - got ${posts.length} posts`,
          { stillPending },
          DEBUG_PREFIX
        );

      allPosts.push(...posts);

      if (limit && allPosts.length >= limit) {
        if (DEBUG)
          logger.debug(
            `getAllOfQuery - limit reached`,
            { limit, n: allPosts.length },
            DEBUG_PREFIX
          );

        stillPending = false;
      }

      if (posts.length > 0) {
        queryParams.fetchParams.untilId = posts[posts.length - 1].id;
      }

      if (DEBUG)
        logger.debug(
          `getAllOfQuery - sinceId updated to ${queryParams.fetchParams.sinceId}`,
          undefined,
          DEBUG_PREFIX
        );
    }

    return limit ? allPosts.slice(0, limit) : allPosts;
  }

  /** Cannot be part of a transaction */
  public async getNonParsedOfProfiles(profilesIds: string): Promise<string[]> {
    /** type protection agains properties renaming */
    const statusKey: keyof AppPost = 'parsedStatus';
    const authorProfileIdKey: keyof AppPost = 'authorProfileId';

    const statusValue: AppPostParsedStatus = AppPostParsedStatus.UNPROCESSED;

    const posts = await this.db.collections.posts
      .where(statusKey, '==', statusValue)
      .where(authorProfileIdKey, 'in', profilesIds)
      .get();

    return posts.docs.map((doc) => doc.id) as string[];
  }
}

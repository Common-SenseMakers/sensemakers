import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';

import { ClusterInstance } from '../@shared/types/types.clusters';
import { ArrayIncludeQuery } from '../@shared/types/types.posts';
import {
  AppPost,
  AppPostCreate,
  AppPostParsedStatus,
  PostUpdate,
  PostsQueryDefined,
} from '../@shared/types/types.posts';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { DBInstance, Query } from '../db/instance';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { hashUrl } from '../links/links.utils';
import {
  AUTHOR_PROFILE_KEY,
  AUTHOR_USER_KEY,
  CREATED_AT_KEY,
  ORIGIN_KEY,
  SCORE_KEY,
  STRUCTURED_SEMANTICS_KEY,
  TABS_KEY,
  TOPIC_KEY,
} from '../posts/posts.helper';
import { IndexedPostsRepo } from './indexed.posts.repository';

const DEBUG = false;
const DEBUG_PREFIX = 'PostsRepository';

const filterByEqual = (
  _base: Query,
  key: string,
  value: undefined | string | number | boolean
) => {
  let query = _base;

  if (value !== undefined) {
    if (DEBUG)
      logger.debug(`getMany - filter by ${key} equals`, value, DEBUG_PREFIX);

    query = query.where(key, '==', value);
  }

  return query;
};

const filterByIn = (_base: Query, key: string, values?: string[]) => {
  let query = _base;

  if (!values) return query;

  if (values && values.length > 0) {
    if (DEBUG)
      logger.debug(`getMany - filter by ${key} in`, values, DEBUG_PREFIX);

    query = query.where(key, 'in', values);
  }

  return query;
};

export const filterByArrayContainsAny = (
  _base: Query,
  key: string,
  values?: ArrayIncludeQuery
) => {
  let query = _base;

  if (!values) return query;

  if (values && values.length > 0) {
    if (DEBUG)
      logger.debug(`getMany - filter by ${key} includes`, values, DEBUG_PREFIX);

    query = query.where(key, 'array-contains-any', values);
  }

  return query;
};

export class PostsRepository extends BaseRepository<AppPost, AppPostCreate> {
  constructor(protected db: DBInstance) {
    super(db.collections.posts);
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

  /** checks if this query should use a subcollection and set up the query object on the best collection */
  private getBaseQuery = (
    queryParams: PostsQueryDefined,
    cluster: ClusterInstance
  ) => {
    if (queryParams.semantics?.ref) {
      const refId = hashUrl(queryParams.semantics.ref);
      const indexedRepo = new IndexedPostsRepo(
        cluster.collection(CollectionNames.Refs)
      );
      return indexedRepo.getPostsCollection(refId);
    }

    if (queryParams.semantics?.keyword) {
      const keyword = queryParams.semantics.keyword;
      const indexedRepo = new IndexedPostsRepo(
        cluster.collection(CollectionNames.Keywords)
      );
      return indexedRepo.getPostsCollection(keyword);
    }

    /** general posts subcollection */
    return cluster.collection(CollectionNames.Posts);
  };

  /** Cannot be part of a transaction */
  public async getMany(
    queryParams: PostsQueryDefined,
    cluster: ClusterInstance
  ) {
    /** type protection against properties renaming */
    if (DEBUG) logger.debug('getMany', queryParams, DEBUG_PREFIX);

    const baseQuery = this.getBaseQuery(queryParams, cluster);

    let query = filterByEqual(baseQuery, AUTHOR_USER_KEY, queryParams.userId);

    query = filterByEqual(query, AUTHOR_PROFILE_KEY, queryParams.profileId);

    query = filterByIn(query, ORIGIN_KEY, queryParams.origins);

    const tabIx = queryParams.semantics?.tab;
    query =
      tabIx !== undefined
        ? filterByEqual(
            query,
            `${STRUCTURED_SEMANTICS_KEY}.${TABS_KEY}.isTab${tabIx.toString().padStart(2, '0')}`,
            true
          )
        : query;

    query = filterByEqual(
      query,
      `${STRUCTURED_SEMANTICS_KEY}.${TOPIC_KEY}`,
      queryParams.semantics?.topic
    );

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
      if (queryParams.fetchParams.rankByScore) {
        const ordered = _base.orderBy(
          `${SCORE_KEY}.${queryParams.fetchParams.rankByScore}`,
          'desc'
        );
        return ordered;
      }
      if (sinceCreatedAt) {
        const ordered = _base.orderBy(CREATED_AT_KEY, 'asc');
        return ordered.startAfter(sinceCreatedAt);
      }
      const ordered = _base.orderBy(CREATED_AT_KEY, 'desc');
      return untilCreatedAt ? ordered.startAfter(untilCreatedAt) : ordered;
    })(query);

    const postsIds = await paginated
      .limit(queryParams.fetchParams.expectedAmount)
      .select('id')
      .get();

    /** need to get the full AppPost objects since the baseQuery just included indexed properties */
    const docIds = postsIds.docs.map((doc) => doc.id);
    const appPosts = await this.getFromIds(docIds);

    if (queryParams.fetchParams.rankByScore) {
      return appPosts;
    }
    return appPosts.sort((a, b) => b.createdAtMs - a.createdAtMs);
  }

  public async getAllOfQuery(
    queryParams: PostsQueryDefined,
    cluster: ClusterInstance,
    limit?: number
  ) {
    let stillPending = true;
    const allPosts: AppPost[] = [];

    while (stillPending) {
      if (DEBUG) logger.debug('getAllOfQuery', queryParams, DEBUG_PREFIX);
      const posts = await this.getMany(queryParams, cluster);

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

  delete(postId: string, manager: TransactionManager) {
    const ref = this.getRef(postId);
    manager.delete(ref);
  }
}

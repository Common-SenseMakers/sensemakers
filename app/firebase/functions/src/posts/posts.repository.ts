import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';

import {
  ArrayIncludeQuery,
  RefLabel,
  StructuredSemantics,
} from '../@shared/types/types.posts';
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

const DEBUG = false;
const DEBUG_PREFIX = 'PostsRepository';

type Query = FirebaseFirestore.Query<
  FirebaseFirestore.DocumentData,
  FirebaseFirestore.DocumentData
>;

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

const filterByArrayContainsAny = (
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
    /** type protection against properties renaming */
    const createdAtKey: keyof AppPost = 'createdAtMs';
    const authorUserKey: keyof AppPost = 'authorUserId';
    // const authorProfileKey: keyof AppPost = 'authorProfileId';
    const originKey: keyof AppPost = 'origin';

    const structuredSemanticsKey: keyof AppPost = 'structuredSemantics';

    const keywordsKey: keyof StructuredSemantics = 'keywords';

    // const refsMetaKey: keyof StructuredSemantics = 'refsMeta';
    // const urlKey: keyof RefMeta = 'url';

    const labelsKey: keyof StructuredSemantics = 'labels';
    const topicKey: keyof StructuredSemantics = 'topic';
    const refsKey: keyof StructuredSemantics = 'refs';

    if (DEBUG) logger.debug('getMany', queryParams, DEBUG_PREFIX);

    let query = filterByEqual(
      this.db.collections.posts,
      authorUserKey,
      queryParams.userId
    );

    query = filterByIn(query, originKey, queryParams.origins);

    query = filterByArrayContainsAny(
      query,
      `${structuredSemanticsKey}.${refsKey}`,
      queryParams.semantics?.refs
    );

    query = filterByArrayContainsAny(
      query,
      `${structuredSemanticsKey}.${labelsKey}`,
      queryParams.semantics?.labels
    );

    query = filterByArrayContainsAny(
      query,
      `${structuredSemanticsKey}.${keywordsKey}`,
      queryParams.semantics?.keywords
    );

    query = filterByEqual(
      query,
      `${structuredSemanticsKey}.${topicKey}`,
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
      if (sinceCreatedAt) {
        const ordered = _base.orderBy(createdAtKey, 'asc');
        return ordered.startAfter(sinceCreatedAt);
      } else {
        const ordered = _base.orderBy(createdAtKey, 'desc');
        return untilCreatedAt ? ordered.startAfter(untilCreatedAt) : ordered;
      }
    })(query);

    const posts = await paginated
      .limit(queryParams.fetchParams.expectedAmount)
      .get();

    let appPosts = posts.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppPost[];

    return appPosts.sort((a, b) => b.createdAtMs - a.createdAtMs);
  }

  public async getAggregatedRefLabels(
    references: string[]
  ): Promise<Record<string, RefLabel[]>> {
    const refsStats: Record<string, RefLabel[]> = {};

    const referencePosts = await this.getMany({
      semantics: { refs: references },
      fetchParams: { expectedAmount: 100 },
    });

    referencePosts.forEach((referencePost) => {
      references.forEach((reference) => {
        if (referencePost.structuredSemantics?.refsMeta) {
          const refMeta = referencePost.structuredSemantics.refsMeta[reference];
          const refLabels = refMeta?.labels?.map(
            (label): RefLabel => ({
              label,
              postId: referencePost.id,
              authorProfileId: referencePost.authorProfileId,
              platformPostUrl: referencePost.generic.thread[0].url,
            })
          );
          const updatedLabels = [
            ...(refsStats[reference] || []),
            ...(refLabels || []),
          ];
          refsStats[reference] = updatedLabels;
        }
      });
    });

    return refsStats;
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

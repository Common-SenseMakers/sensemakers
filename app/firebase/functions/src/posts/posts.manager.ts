import { DataFactory } from 'n3';

import { ClusterInstance } from '../@shared/types/types.clusters';
import { FetchParams, PlatformFetchParams } from '../@shared/types/types.fetch';
import {
  PARSER_MODE,
  ParsePostRequest,
  ParsePostResult,
  SciFilterClassfication,
  TopicsParams,
} from '../@shared/types/types.parser';
import {
  EngagementMetrics,
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
  PlatformPostPosted,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../@shared/types/types.platform.posts';
import {
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
  PLATFORM_SESSION_REFRESH_ERROR,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AppPost,
  AppPostParsedStatus,
  AppPostParsingStatus,
  HydrateConfig,
  IndexedPost,
  PostUpdate,
  PostsQuery,
  UpdatedKeywords,
} from '../@shared/types/types.posts';
import { FetchedDetails } from '../@shared/types/types.profiles';
import { AccountCredentials, AppUser } from '../@shared/types/types.user';
import {
  handleQuotePostReference,
  normalizeUrl,
} from '../@shared/utils/links.utils';
import {
  cloneStore,
  forEachStore,
  parseRDF,
  writeRDF,
} from '../@shared/utils/n3.utils';
import { getProfileId } from '../@shared/utils/profiles.utils';
import {
  HAS_TOPIC_URI,
  LINKS_TO_URI,
  NOT_SCIENCE_TOPIC_URI,
  SCIENCE_TOPIC_URI,
  THIS_POST_NAME_URI,
  isReferenceLabel,
  isZoteroType,
} from '../@shared/utils/semantics.helper';
import { ClustersService } from '../clusters/clusters.service';
import { PARSING_TIMEOUT_MS } from '../config/config.runtime';
import { processInBatches } from '../db/db.utils';
import { DBInstance } from '../db/instance';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { OntologiesService } from '../ontologies/ontologies.service';
import { ParserService } from '../parser/parser.service';
import { PlatformsService } from '../platforms/platforms.service';
import { ProfilesService } from '../profiles/profiles.service';
import { TimeService } from '../time/time.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsProcessing } from './posts.processing';

const DEBUG = false;

/**
 * Top level methods. They instantiate a TransactionManger and execute
 * read and writes to the DB
 */
export class PostsManager {
  constructor(
    protected db: DBInstance,
    protected users: UsersService,
    protected profiles: ProfilesService,
    public processing: PostsProcessing,
    protected platforms: PlatformsService,
    protected parserService: ParserService,
    protected time: TimeService,
    public ontologies: OntologiesService,
    protected clusters: ClustersService
  ) {}

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll() {
    const usersIds = await this.users.repo.getAll();

    /** Call fetch for each user */
    const posts = await Promise.all(
      usersIds.map(async (userId) =>
        this.fetchUser({ userId, params: { expectedAmount: 10 } })
      )
    );

    return posts.flat();
  }

  private initPlatformPost<T = any>(
    platformId: PLATFORM,
    fetchedPost: PlatformPostPosted<T>
  ) {
    const platformPost: PlatformPostCreate = {
      post_id: fetchedPost.post_id,
      platformId: platformId as PUBLISHABLE_PLATFORM,
      publishStatus: PlatformPostPublishStatus.PUBLISHED,
      publishOrigin: PlatformPostPublishOrigin.FETCHED,
      posted: fetchedPost,
      metrics: fetchedPost.metrics,
    };

    return platformPost;
  }

  public async fetchPostFromPlatform(
    userId: string,
    platformId: PUBLISHABLE_PLATFORM,
    post_id: string,
    manager: TransactionManager
  ) {
    const user = await this.users.repo.getUser(userId as string, manager, true);
    const platform = this.platforms.get(platformId);

    const account = UsersHelper.getAccount(user, platformId);
    if (!account) {
      throw new Error(`Account not found for platform ${platformId}`);
    }

    try {
      const { platformPost, credentials: newCredentials } =
        await platform.getThread(post_id, account.credentials);

      if (newCredentials) {
        await this.users.updateAccountCredentials(
          userId,
          platformId,
          account.user_id,
          newCredentials,
          manager
        );
      }

      const platformPostCreate = this.initPlatformPost(
        platformId,
        platformPost
      );

      const platformPostCreated = await this.processing.createPlatformPost(
        platformPostCreate,
        manager
      );

      if (!platformPostCreated) {
        throw new Error(`PlatformPost already exists: ${post_id}`);
      }

      return platformPostCreated;
    } catch (err: any) {
      logger.error(
        `error fetching post ${post_id} from platform ${platformId}`,
        { err }
      );

      return { post: undefined };
    }
  }

  async fetchAndUpdatePostsMetrics(posts: AppPost[]) {
    const metrics = await this.fetchPostsMetrics(posts);

    await this.db.run(async (manager) => {
      for (const postMetrics of Object.entries(metrics)) {
        const [postId, metrics] = postMetrics;
        this.updatePost(postId, { metrics }, manager);
      }
    });
  }

  /**
   * Split an array of posts by platforms, get the metrics for all posts of one platform in a batch
   * and returns an updated map of posts with their new
   */
  async fetchPostsMetrics(
    posts: AppPost[]
  ): Promise<Record<string, EngagementMetrics>> {
    const postsByPlatform = new Map<PLATFORM, AppPost[]>();
    const postsMetrics: Record<string, EngagementMetrics> = {};

    posts.forEach((post) => {
      const platformId = post.origin;
      const posts = postsByPlatform.get(platformId) || [];
      posts.push(post);
      postsByPlatform.set(platformId, posts);
    });

    for (const platformAndPosts of postsByPlatform.entries()) {
      const [platformId, posts] = platformAndPosts;
      const platformPostDocIds = posts.map((post) => post.mirrorsIds[0]);

      const platformPosts =
        await this.processing.platformPosts.getFromIds(platformPostDocIds);

      const platformPostIds = platformPosts
        .map((post) => post.post_id)
        .filter((postId) => postId !== undefined);

      interface PostWithIds {
        post_id: string;
        post: AppPost;
      }

      /** keep the links between the AppPost and the post_id */
      const postsWithIds: PostWithIds[] = posts.map((post) => {
        const post_id = platformPosts.find(
          (platformPost) => platformPost.id === post.mirrorsIds[0]
        )?.post_id;

        if (!post_id) {
          throw new Error(
            `could not find platformPost with mirror id ${post.mirrorsIds[0]}`
          );
        }

        return { post_id, post };
      });

      const platformService = this.platforms.get(platformId);
      const { metrics } =
        await platformService.getPostsMetrics(platformPostIds);

      for (const postMetrics of Object.entries(metrics)) {
        const [platformPostId, metrics] = postMetrics;
        const postWithIds = postsWithIds.find(
          (postWithIds) => postWithIds.post_id === platformPostId
        );

        if (!postWithIds) {
          throw new Error('Unexpected');
        }

        const { post } = postWithIds;
        postsMetrics[post.id] = metrics;
      }
    }

    return postsMetrics;
  }

  private async getPlatformPostTimestamp(
    platformId: PLATFORM,
    post_id: string,
    manager: TransactionManager
  ) {
    const platformPostId = await this.processing.platformPosts.getFrom_post_id(
      platformId,
      post_id,
      manager
    );

    const platformPostPosted = await (async () => {
      if (platformPostId) {
        const post = await this.processing.platformPosts.get<
          true,
          PlatformPost
        >(platformPostId, manager, true);
        return post.posted;
      } else {
        const result = await this.platforms
          .get(platformId)
          .getSinglePost(post_id);

        return result.platformPost;
      }
    })();

    if (!platformPostPosted) {
      throw new Error('PlatformPost not found');
    }

    return platformPostPosted.timestampMs;
  }

  private async appendTimestamps(
    platformId: PLATFORM,
    params: PlatformFetchParams,
    manager: TransactionManager
  ) {
    if (params.since_id) {
      params.since_timestamp = await this.getPlatformPostTimestamp(
        platformId,
        params.since_id,
        manager
      );
    }

    if (params.until_id) {
      params.until_timestamp = await this.getPlatformPostTimestamp(
        platformId,
        params.until_id,
        manager
      );
    }

    return params;
  }

  /**
   * Read the platformPosts from a platform,
   * Manages the fetched property of the Profile keeping the oldest and newest fetched posts ids.
   * Uses credentials if provided
   */
  private async fetchAccountFromPlatform(
    platformId: PLATFORM,
    user_id: string,
    params: FetchParams,
    manager: TransactionManager,
    credentials?: AccountCredentials,
    userId?: string
  ) {
    const profile = await this.profiles.getOrCreateProfile(
      { profileId: getProfileId(platformId, user_id) },
      manager
    );

    const platformParams = await this.preparePlatformParams(
      params,
      profile.fetched
    );

    /** just add timestamps to bksy fethes for now */
    const newParams =
      platformId === PLATFORM.Bluesky
        ? await this.appendTimestamps(platformId, platformParams, manager)
        : platformParams;

    if (DEBUG) logger.debug(`Platform Service - fetch ${platformId}`);

    try {
      const fetchedPosts = await this.platforms.fetch(
        user_id,
        platformId,
        newParams,
        credentials
      );

      if (fetchedPosts.credentials && userId) {
        await this.users.updateAccountCredentials(
          userId,
          platformId,
          user_id,
          fetchedPosts.credentials,
          manager
        );
      }

      if (DEBUG)
        logger.debug(
          `fetchUser ${platformId} - platformPosts: ${fetchedPosts.platformPosts.length}`,
          {
            fetched: fetchedPosts,
          }
        );

      const newFetchedDetails = await this.getNewFetchedStatus(
        platformParams,
        fetchedPosts.fetched
      );

      await this.profiles.repo.setAccountProfileFetched(
        platformId,
        user_id,
        newFetchedDetails,
        manager
      );

      /** convert them into a PlatformPost */
      return fetchedPosts.platformPosts.map((fetchedPost) =>
        this.initPlatformPost(platformId, fetchedPost)
      );
    } catch (err: any) {
      if (userId && err.name === PLATFORM_SESSION_REFRESH_ERROR) {
        logger.warn(
          `Error at fetchAccountFromPlatform for user_id ${user_id} on platform ${platformId}. Marking as disconnected.`,
          { err }
        );
        await this.users.updateAccountDisconnectedStatus(
          userId,
          platformId,
          user_id,
          true,
          manager
        );
      } else {
        logger.error(
          `Error at fetchAccountFromPlatform for user_id ${user_id} on platform ${platformId}`,
          { err }
        );
      }

      return undefined;
    }
  }

  /**
   * From a requested FetchedDetails, derive the actual
   * PlatformFetchParams based on that user account fetched
   * values
   */
  async preparePlatformParams(
    params: FetchParams,
    fetched?: FetchedDetails
  ): Promise<PlatformFetchParams> {
    if (params.sinceId) {
      return {
        since_id: fetched?.newest_id,
        expectedAmount: params.expectedAmount,
      };
    }

    if (params.untilId) {
      return {
        until_id: fetched?.oldest_id,
        expectedAmount: params.expectedAmount,
      };
    }

    /**
     * if no parameters are provided, if user has
     * newestId, fetch forward since then, if not
     * fetch without parameters (which is equivalent to
     * latest backwards)
     */

    if (fetched?.newest_id) {
      return {
        since_id: fetched?.newest_id,
        expectedAmount: params.expectedAmount,
      };
    }

    return {
      expectedAmount: params.expectedAmount,
    };
  }

  /**
   * From the PlatformFetchParams and the actual
   * fetched results, update the user profile fetched
   * value
   */
  protected async getNewFetchedStatus(
    platformParams: PlatformFetchParams,
    fetched: FetchedDetails
  ) {
    /** keep track of the newest and oldest posts */
    const newFetchedDetails: FetchedDetails = {};

    /**
     * if until_id was requested, the fetched oldest_id will be the
     * new oldest_id
     */
    if (platformParams.until_id && fetched.oldest_id) {
      newFetchedDetails.oldest_id = fetched.oldest_id;
    }

    /**
     * if since_id was requested, the fetched newest_id will be the
     * new newest_id
     */
    if (platformParams.since_id && fetched.newest_id) {
      newFetchedDetails.newest_id = fetched.newest_id;
    }

    /**
     * if neither since_id nor until_id were requested, both
     * the newest and oldest fetched ids will be the absolute ones
     */
    if (!platformParams.since_id && !platformParams.until_id) {
      newFetchedDetails.newest_id = fetched.newest_id;
      newFetchedDetails.oldest_id = fetched.oldest_id;
    }

    return newFetchedDetails;
  }

  /**
   * Fetch posts of one user_id on a platformId.
   * The provided credentials, if provided, will be the ones used to fetch
   */
  async fetchAccount(
    platformId: PLATFORM,
    user_id: string,
    params: FetchParams,
    manager: TransactionManager,
    credentials?: AccountCredentials,
    userId?: string
  ) {
    try {
      if (DEBUG)
        logger.debug(
          `fetchUser - fetchAccount. platformId:${platformId} - account:${user_id}`,
          {
            platformId,
          }
        );

      const platformPostsCreate = await this.fetchAccountFromPlatform(
        platformId,
        user_id,
        params,
        manager,
        credentials,
        userId
      );

      if (!platformPostsCreate) {
        return;
      }

      const authorUserId =
        await this.profiles.repo.getUserIdWithPlatformAccount(
          platformId,
          user_id,
          manager
        );

      /** Create the PlatformPosts and AppPosts */
      const platformPostsCreated =
        await this.processing.createOrMergePlatformPosts(
          platformPostsCreate,
          manager,
          authorUserId
        );

      /** make sure the profiles of each post exist */
      const profileIds = new Set<string>();

      /** Perform actions en each created post */
      await Promise.all(
        platformPostsCreated.map(async (created) => {
          /** keep track of author profiles to create them later */
          if (!profileIds.has(created.post.authorProfileId)) {
            profileIds.add(created.post.authorProfileId);
          }

          /** update the scores at creating (will also sync in clusters already) */
          await this.updatePost(
            created.post.id,
            { metrics: created.post.metrics },
            manager
          );
        })
      );

      await Promise.all(
        Array.from(profileIds).map((profileId) => {
          this.profiles.getOrCreateProfile({ profileId }, manager);
        })
      );

      if (DEBUG)
        logger.debug(
          `fetchUser - platformId:${platformId} - account:${user_id} - platformPostsCreated: ${platformPostsCreated.length}`,
          {
            platformPostsCreated,
          }
        );

      return platformPostsCreated;
    } catch (err: any) {
      logger.error(
        `Error at fetchAccount for user_id ${user_id} on platform ${platformId}`,
        { err }
      );

      return undefined;
    }
  }

  /**
   * Fetch and store platform posts of one singedup user
   * (in one Transaction).
   *
   * Uses the user accounts to derive the fetch credentials.
   * If params.platformIds is not provided, fetches
   * from all registered accounts for that user
   *
   * if mode === 'forward' fetches from the newset fetched date
   * if mode === 'backwards' fetches from the oldest fetched date
   * */
  async fetchUser(inputs: {
    userId?: string;
    user?: AppUser;
    params: FetchParams;
    platformIds?: IDENTITY_PLATFORM[];
  }) {
    /** can be called as part of a transaction or independently */
    const postsCreated = await this.db.run(
      async (manager: TransactionManager) => {
        const user =
          inputs.user ||
          (await this.users.repo.getUser(
            inputs.userId as string,
            manager,
            true
          ));

        if (DEBUG) logger.debug(`fetchUser user: ${user.userId}`, { user });

        return Promise.all(
          (inputs.platformIds || ALL_PUBLISH_PLATFORMS).map(
            async (platformId) => {
              const accounts = UsersHelper.getAccounts(user, platformId);
              /** Call fetch for each account */
              return Promise.all(
                accounts.map(
                  async (
                    account
                  ): Promise<PlatformPostCreated[] | undefined> => {
                    const user_id = account.user_id;

                    const result = await this.fetchAccount(
                      platformId,
                      user_id,
                      inputs.params,
                      manager,
                      account.credentials,
                      user.userId
                    );
                    return result;
                  }
                )
              );
            }
          )
        );
      }
    );

    const postsCreatedAll = postsCreated
      .flat(2)
      .filter((p) => p !== undefined) as PlatformPostCreated[];

    return postsCreatedAll;
  }

  /**
   * single place where new posts are fetched for a signedup user
   * from any platform
   * */
  private async fetchIfNecessary(
    queryParams: PostsQuery,
    cluster: ClusterInstance
  ): Promise<{
    posts: AppPost[];
    enough: boolean;
  }> {
    if (queryParams.userId === undefined) {
      throw new Error('userId is a required query parameter here');
    }

    /** fetch only if queryuing for all posts of a user */
    if (queryParams.semantics || queryParams.profileId) {
      return { posts: [], enough: true };
    }

    /** if sinceId is provided fetch forward always */
    if (queryParams.fetchParams.sinceId !== undefined && queryParams.userId) {
      /** fetch platforms for new PlatformPosts */
      await this.fetchUser({
        userId: queryParams.userId,
        params: queryParams.fetchParams,
      });
    }

    let enough: boolean = true;

    /** if untilId is provided fetch backwards, but only if not enough posts are already stored */
    const posts = await this.processing.posts.getMany(queryParams, cluster);

    /** fetch if older posts are less thant he expected amount */
    if (posts.length < queryParams.fetchParams.expectedAmount) {
      enough = false;

      await this.fetchUser({
        userId: queryParams.userId,
        params: queryParams.fetchParams,
      });
    }

    /** fetch if there is a platform (maybe a recently connected one) without fetched details */
    const profiles = await this.db.run((manager) => {
      if (queryParams.userId === undefined) {
        throw new Error('userId is a required query parameter here');
      }
      return this.profiles.repo.getOfUser(queryParams.userId, manager);
    });

    const platformsWithoutFetch = profiles
      .filter((profile) => profile.fetched !== undefined)
      .map((profile) => profile.platformId);

    if (platformsWithoutFetch.length > 0) {
      enough = false;

      await this.fetchUser({
        userId: queryParams.userId,
        platformIds: platformsWithoutFetch,
        params: {
          ...queryParams.fetchParams,
        },
      });
    }

    return {
      posts,
      enough,
    };
  }

  /** get AppPost and fetch for new posts if necessary */
  private async getAndFetchIfNecessary(
    queryParams: PostsQuery,
    cluster: ClusterInstance
  ) {
    if (!queryParams.userId) {
      throw new Error('userId is required');
    }

    /** only fetch if searching for all "my posts" and not filtering by status or  */
    const { posts, enough } = await this.fetchIfNecessary(queryParams, cluster);

    /**
     * after fetching (if it was necessary), get the posts from
     * the db. If there were enough posts already, then no need to
     * read from the db again
     */
    const _posts = await (async () => {
      if (enough) {
        return posts;
      }

      return this.processing.posts.getMany(
        {
          ...queryParams,
          userId: queryParams.userId,
        },
        cluster
      );
    })();

    return _posts;
  }
  /** Get posts AppPostFull of user, cannot be part of a transaction
   * We trigger fetching posts from the platforms from here
   */
  async getOfUser(_queryParams: PostsQuery) {
    if (!_queryParams.userId) {
      throw new Error('userId is required');
    }

    const addAggregatedLabels =
      _queryParams.hydrateConfig?.addAggregatedLabels !== undefined
        ? _queryParams.hydrateConfig.addAggregatedLabels
        : false;

    const addMirrors =
      _queryParams.hydrateConfig?.addMirrors !== undefined
        ? _queryParams.hydrateConfig.addMirrors
        : true;

    const hydrateConfig: HydrateConfig = {
      addAggregatedLabels,
      addMirrors,
    };

    const queryParams = _queryParams;

    const cluster = this.clusters.getInstance(queryParams.clusterId);
    const appPosts = await this.getAndFetchIfNecessary(queryParams, cluster);

    const postsFull = await Promise.all(
      appPosts.map((post) =>
        this.db.run((manager) =>
          this.processing.hydratePostFull(post, hydrateConfig, manager, cluster)
        )
      )
    );

    if (DEBUG)
      logger.debug(
        `getOfUser query for user ${queryParams.userId} has ${appPosts.length} results for query params: `,
        { queryParams }
      );

    return postsFull;
  }

  async getPost<T extends boolean>(
    postId: string,
    config: HydrateConfig,
    shouldThrow?: T,
    manager?: TransactionManager,
    clusterId?: string
  ) {
    const func = async (manager: TransactionManager) => {
      const cluster = this.clusters.getInstance(clusterId);

      const post = await this.processing.getPostFull(
        postId,
        config,
        manager,
        cluster,
        shouldThrow
      );
      // use this occassion to check if post processing expired
      if (post && post.parsingStatus === AppPostParsingStatus.PROCESSING) {
        if (
          post.parsingStartedAtMs &&
          this.time.now() >= post.parsingStartedAtMs + PARSING_TIMEOUT_MS
        ) {
          await this.updatePost(
            postId,
            {
              parsingStatus: AppPostParsingStatus.EXPIRED,
            },
            manager
          );

          // re-read post with latest parsingStatus
          return this.processing.getPostFull(
            postId,
            config,
            manager,
            cluster,
            shouldThrow
          );
        }
      }

      return post;
    };

    if (manager) return func(manager);
    else return this.db.run((manager) => func(manager));
  }

  async parsePost(postId: string) {
    const shouldParse = await this.db.run(
      async (manager) => {
        const post = await this.processing.posts.get(postId, manager, true);
        if (post.parsingStatus === 'processing') {
          if (DEBUG) logger.debug(`parsePost - already parsing ${postId}`);
          return false;
        }

        if (post.parsedStatus === AppPostParsedStatus.PROCESSED) {
          if (DEBUG) logger.debug(`parsePost - already parsed ${postId}`);
          return false;
        }

        if (DEBUG) logger.debug(`parsePost - marking as parsing ${postId}`);
        await this.updatePost(
          postId,
          {
            parsingStatus: AppPostParsingStatus.PROCESSING,
            parsingStartedAtMs: this.time.now(),
          },
          manager
        );

        return true;
      },
      undefined,
      undefined,
      `parsePost - shouldParse ${postId}`
    );

    if (shouldParse) {
      /** then process */
      try {
        await this._parsePost(postId);
      } catch (err: any) {
        await this.db.run(
          async (manager) => {
            logger.error(`Error parsing post ${postId}`, err);
            await this.updatePost(
              postId,
              { parsingStatus: AppPostParsingStatus.ERRORED },
              manager
            );
          },
          undefined,
          undefined,
          `parsePost - parsing ${postId}`
        );
      }
    }
  }

  /** single place where we enforce rules over semantics before feeding our system */
  public async sanitizeParserResult(
    post: AppPost,
    parserResult: ParsePostResult
  ): Promise<ParsePostResult> {
    /** process semantics and enfore */
    const originalStore = await parseRDF(parserResult.semantics);
    const newStore = cloneStore(originalStore);
    const newResult = { ...parserResult };

    /** PATCH #1: Science topic must be in the semantics */
    const isScience = [
      SciFilterClassfication.AI_DETECTED_RESEARCH,
      SciFilterClassfication.CITOID_DETECTED_RESEARCH,
    ].includes(parserResult.filter_classification);

    newStore.addQuad(
      DataFactory.quad(
        DataFactory.namedNode(THIS_POST_NAME_URI),
        DataFactory.namedNode(HAS_TOPIC_URI),
        DataFactory.namedNode(
          isScience ? SCIENCE_TOPIC_URI : NOT_SCIENCE_TOPIC_URI
        )
      )
    );

    forEachStore(originalStore, (quad) => {
      if (isReferenceLabel(quad)) {
        const originalReference = quad.object.value;
        /** PATCH #2: References must use normalized urls */
        const _normalizedReference = normalizeUrl(originalReference);
        const normalizedReference = handleQuotePostReference(
          _normalizedReference,
          post
        );

        newStore.removeQuad(quad);
        newStore.addQuad(
          DataFactory.quad(
            quad.subject,
            quad.predicate,
            DataFactory.namedNode(normalizedReference)
          )
        );

        /** PATCH #3: We enforce a linksTo label */
        const linksToQuad = DataFactory.quad(
          DataFactory.namedNode(THIS_POST_NAME_URI),
          DataFactory.namedNode(LINKS_TO_URI),
          DataFactory.namedNode(normalizedReference)
        );

        const unormalizedLinksTo = DataFactory.quad(
          DataFactory.namedNode(THIS_POST_NAME_URI),
          DataFactory.namedNode(LINKS_TO_URI),
          DataFactory.namedNode(originalReference)
        );

        if (newStore.has(unormalizedLinksTo)) {
          newStore.removeQuad(unormalizedLinksTo);
        }

        if (!newStore.has(linksToQuad)) {
          newStore.addQuad(linksToQuad);
        }

        /** PATCH #4: Use normalized references in the support data too */
        const originalRefMeta = newResult.support?.refs_meta;

        if (originalRefMeta) {
          const refMeta = originalRefMeta[originalReference];
          /** delete the old entry */
          delete originalRefMeta[originalReference];
          /** add it as normalized */
          originalRefMeta[normalizedReference] = refMeta;
        }

        /** PATCH #5: Reference Zotero type must use the normalized version too */
        forEachStore(originalStore, (quadForType) => {
          if (isZoteroType(quadForType)) {
            if (quadForType.object.value !== originalReference) {
              const newTypeQuad = DataFactory.quad(
                DataFactory.namedNode(normalizedReference),
                quadForType.predicate,
                quadForType.object
              );

              newStore.removeQuad(quadForType);
              newStore.addQuad(newTypeQuad);
            }

            newStore.removeQuad(quadForType);
          }
        });
      }
    });

    const newSemantics = await writeRDF(newStore);

    if (!newSemantics) {
      throw new Error('Unexpected error writing RDF');
    }

    newResult.semantics = newSemantics;

    return newResult;
  }

  protected async _parsePost(postId: string) {
    /** split the read post and write semantics in two transactions because the parsePost
     * can take longer than the transaction expiration time */
    const post = await this.db.run(async (manager) => {
      return this.processing.posts.get(postId, manager, true);
    });

    if (DEBUG) logger.debug(`parsePost - start ${postId}`, { postId, post });

    const params: ParsePostRequest<TopicsParams> = {
      post: post.generic,
      parameters: {
        [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
      },
    };

    /** Call the parser */
    const _parserResult = await this.parserService.parsePost(params);

    if (!_parserResult) {
      throw new Error(`Error parsing post: ${post.id}`);
    }

    /** single place where we enforce rules over semantics */
    const parserResult = await this.sanitizeParserResult(post, _parserResult);

    if (DEBUG) logger.debug(`parsePost - done ${postId}`, { postId });

    /** store the semantics and mark as processed */
    await this.db.run(async (manager) => {
      const parserOntology = parserResult.support?.ontology;
      /** store the ontology */
      if (parserOntology) {
        if (parserOntology.semantic_predicates) {
          await this.ontologies.setMany(
            parserOntology.semantic_predicates,
            manager
          );
        }
        if (parserOntology.keyword_predicate) {
          await this.ontologies.setMany(
            [parserOntology.keyword_predicate],
            manager
          );
        }
        if (parserOntology.topics_predicate) {
          await this.ontologies.setMany(
            [parserOntology.topics_predicate],
            manager
          );
        }
      }

      /** store the semantics in the post */
      const update: PostUpdate = {
        semantics: parserResult.semantics,
        originalParsed: parserResult,
        parsedStatus: AppPostParsedStatus.PROCESSED,
        parsingStatus: AppPostParsingStatus.IDLE,
      };

      return this.updatePost(post.id, update, manager);
    });
  }

  /** single place to update a post (it updates the drafts if necessary) */
  async updatePost(
    postId: string,
    postUpdate: PostUpdate,
    manager: TransactionManager
  ) {
    if (DEBUG) logger.debug(`updatePost ${postId}`, { postId, postUpdate });
    await this.processing.posts.update(postId, postUpdate, manager);

    if (postUpdate.semantics || postUpdate.metrics) {
      const post = await this.processing.posts.get(postId, manager, true);

      const indexedPost: IndexedPost = {
        id: postId,
        authorProfileId: post.authorProfileId,
        origin: post.origin,
        createdAtMs: post.createdAtMs,
        structuredSemantics: post.structuredSemantics,
        scores: post.scores,
      };

      let updatedKeywords: UpdatedKeywords | undefined = undefined;

      /** handle side-effects related to semantics when the post is updated */
      if (postUpdate.semantics) {
        const processedSemantics = await this.processing.processSemantics(
          postId,
          manager,
          postUpdate.semantics
        );

        indexedPost.structuredSemantics =
          processedSemantics?.structuredSemantics;

        updatedKeywords = processedSemantics.updatedKeywords;
      }

      /** handle side-effects related to the rank scoring */
      if (postUpdate.metrics) {
        const scores = this.processing.computeScores(post);
        indexedPost.scores = scores;
      }

      await this.processing.syncPostInClusters(
        'add',
        post.id,
        manager,
        removeUndefined(indexedPost),
        indexedPost.structuredSemantics?.refs || [],
        updatedKeywords
      );
    }
  }

  /**
   * look for users accounts and update the userId property on the corresponding
   * Profiles
   */
  async linkExistingUser(userId: string) {
    /** on transaction to set the profiles */
    await this.db.run(async (manager) => {
      const user = await this.users.repo.getUser(userId, manager, true);

      if (DEBUG) {
        logger.debug('linkExistingUser', { user });
      }

      await Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platform) => {
          const accounts = UsersHelper.getAccounts(user, platform);
          await Promise.all(
            accounts.map(async (account) => {
              /** udpate the profile */
              const profileId = getProfileId(platform, account.user_id);

              if (DEBUG) {
                logger.debug(
                  `linkExistingUser ${userId} to profile ${profileId}`
                );
              }

              const profile = await this.profiles.repo.getByProfileId(
                profileId,
                manager,
                true
              );
              if (!profile) {
                throw new Error('unexpected missing profile');
              }

              await this.profiles.repo.update(profileId, { userId }, manager);
            })
          );
        })
      );
    });

    /** one transaction to read all platform posts */
    const _allPosts = await this.db.run(async (manager) => {
      const user = await this.users.repo.getUser(userId, manager, true);

      return Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platform) => {
          const accounts = UsersHelper.getAccounts(user, platform);
          return Promise.all(
            accounts.map(async (account) => {
              /** udpate the profile */
              const profileId = getProfileId(platform, account.user_id);
              /** get this account platform posts */
              const posts = await this.processing.posts.getAllOfQuery(
                {
                  profileId,
                  fetchParams: { expectedAmount: 1000 },
                },
                this.clusters.getInstance()
              );

              if (DEBUG) {
                logger.debug(`got ${posts.length} posts of ${profileId}`);
              }
              return posts;
            })
          );
        })
      );
    });

    const allPosts = _allPosts.flat(2);

    /** write in batches of 100 */
    const size = 100;
    for (let i = 0; i < allPosts.length; i += size) {
      const thisPosts = allPosts.slice(i, i + size);
      await this.db.run(async (manager) => {
        return Promise.all(
          thisPosts.map((post) => {
            if (DEBUG) {
              logger.debug(`updating author of post ${post.id} to ${userId}`);
            }
            return this.updatePost(post.id, { authorUserId: userId }, manager);
          })
        );
      });
    }
  }
  async deleteAccountFull(platformId: PLATFORM, user_id: string) {
    const profileId = getProfileId(platformId, user_id);

    const posts = await this.processing.posts.getAllOfQuery(
      {
        profileId,
        fetchParams: { expectedAmount: 100000 },
      },
      this.clusters.getInstance()
    );

    if (DEBUG) {
      logger.debug(`fully deleting ${posts.length} posts of ${profileId}`);
    }

    const batchSize = 100;

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      await this.db.run(async (manager) => {
        await Promise.all(
          batch.map((post) => {
            return this.processing.deletePostFull(post.id, manager);
          })
        );
      });
    }

    await this.db.run(async (manager) => {
      const userId = await this.users.repo.getUserIdWithPlatformAccount(
        platformId,
        user_id,
        manager
      );
      if (userId) {
        await this.users.repo.removeAccountDetails(
          platformId,
          user_id,
          manager
        );
      }
      this.profiles.repo.delete(profileId, manager);
    });
  }

  async replacePostsAuthor(existingUserId: string, newUserId: string) {
    const cluster = this.clusters.getInstance();
    const posts = await this.processing.posts.getAllOfQuery(
      {
        userId: existingUserId,
        fetchParams: { expectedAmount: 100 },
      },
      cluster
    );

    await processInBatches(
      posts.map(
        (element) => () =>
          (async (post: AppPost) => {
            try {
              if (DEBUG) console.log(`Processing ${post.id}`);

              await this.db.run(async (manager) => {
                await this.processing.posts.update(
                  post.id,
                  { authorUserId: newUserId },
                  manager
                );
              });
            } catch (error) {
              console.error(`Error processing ${post.id}`, error);
            }
          })(element)
      ),
      10
    );
  }
}

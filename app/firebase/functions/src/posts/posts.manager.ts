import { FetchParams, PlatformFetchParams } from '../@shared/types/types.fetch';
import {
  PARSER_MODE,
  ParsePostRequest,
  SciFilterClassfication,
  TopicsParams,
} from '../@shared/types/types.parser';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
  PlatformPostPosted,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
  PlatformPostSignerType,
  PlatformPostStatusUpdate,
} from '../@shared/types/types.platform.posts';
import {
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostsQuery,
  PostsQueryStatus,
} from '../@shared/types/types.posts';
import {
  AccountProfile,
  AccountProfileCreate,
  FetchedDetails,
} from '../@shared/types/types.profiles';
import { AccountCredentials, AppUser } from '../@shared/types/types.user';
import { PARSING_TIMEOUT_MS } from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { ParserService } from '../parser/parser.service';
import { PlatformsService } from '../platforms/platforms.service';
import { splitProfileId } from '../profiles/profiles.repository';
import { TimeService } from '../time/time.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsHelper } from './posts.helper';
import { PostsProcessing } from './posts.processing';

const DEBUG = true;

const areCredentialsInvalid = (err: { message: string }) => {
  return err.message.includes('Value passed for the token was invalid');
};

/**
 * Top level methods. They instantiate a TransactionManger and execute
 * read and writes to the DB
 */
export class PostsManager {
  constructor(
    protected db: DBInstance,
    protected users: UsersService,
    public processing: PostsProcessing,
    protected platforms: PlatformsService,
    protected parserService: ParserService,
    protected time: TimeService
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
    };

    return platformPost;
  }

  private async resetCredentials(
    platformId: PLATFORM,
    user_id: string,
    manager: TransactionManager
  ) {
    logger.error(
      `Token error fetching from platform ${platformId}. Reset credentials`
    );
    await this.users.repo.removeAccountDetails(platformId, user_id, manager);
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
      const { platformPost, credentials: newCredentials } = await platform.get(
        post_id,
        account.credentials
      );

      if (newCredentials) {
        this.users.updateAccountCredentials(
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
      if (areCredentialsInvalid(err)) {
        await this.resetCredentials(platformId, account.user_id, manager);
        return { post: undefined };
      }

      throw new Error(err);
    }
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
    credentials?: AccountCredentials
  ) {
    const profile = await this.users.profiles.getProfile(
      platformId,
      user_id,
      manager,
      true
    );

    const platformParams = await this.preparePlatformParams(
      params,
      profile.fetched
    );

    if (DEBUG) logger.debug(`Platform Service - fetch ${platformId}`);
    try {
      const fetchedPosts = await this.platforms.fetch(
        user_id,
        platformId,
        platformParams,
        credentials
      );

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

      await this.users.profiles.setAccountProfileFetched(
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
      if (areCredentialsInvalid(err)) {
        await this.resetCredentials(platformId, user_id, manager);
        return undefined;
      }

      throw new Error(err);
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
    credentials?: AccountCredentials
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
        credentials
      );

      if (!platformPostsCreate) {
        return;
      }

      const authorUserId =
        await this.users.profiles.getUserIdWithPlatformAccount(
          platformId,
          user_id,
          manager
        );

      /** Create the PlatformPosts and AppPosts */
      const platformPostsCreated = await this.processing.createPlatformPosts(
        platformPostsCreate,
        manager,
        authorUserId
      );

      /** make sure the profiles of each post exist */
      const profileIds = new Set<string>();

      /** get all unique profiles */
      platformPostsCreated.forEach((posts) => {
        if (!profileIds.has(posts.post.authorProfileId)) {
          profileIds.add(posts.post.authorProfileId);
        }
      });

      await Promise.all(
        Array.from(profileIds).map((profileId) => {
          this.getOrCreateProfile(profileId, manager);
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
        `Error fetching posts for user_id ${user_id} on platform ${platformId}`,
        err
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
                      account.credentials
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
  private async fetchIfNecessary(queryParams: PostsQuery): Promise<{
    posts: AppPost[];
    enough: boolean;
  }> {
    if (queryParams.userId === undefined) {
      throw new Error('userId is a required query parameter here');
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
    const posts = await this.processing.posts.getMany(queryParams);

    if (queryParams.status === PostsQueryStatus.DRAFTS) {
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
        return this.users.profiles.getOfUser(queryParams.userId, manager);
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
    }

    return {
      posts,
      enough,
    };
  }

  /** get AppPost and fetch for new posts if necessary */
  private async getAndFetchIfNecessary(queryParams: PostsQuery) {
    if (!queryParams.userId) {
      throw new Error('userId is required');
    }

    const { posts: older, enough } = await this.fetchIfNecessary(queryParams);

    /**
     * after fetching (if it was necessary), get the posts from
     * the db. If there were enough posts already, then no need to
     * read from the db again
     */
    const posts = await (async () => {
      if (enough) {
        return older;
      }

      return this.processing.posts.getMany({
        ...queryParams,
        userId: queryParams.userId,
      });
    })();

    return posts;
  }

  async createProfile<P = any>(
    profileId: string,
    manager: TransactionManager
  ): Promise<AccountProfile<P>> {
    const { platform, user_id } = splitProfileId(profileId);

    const profileBase = await this.platforms.getProfile(platform, user_id);

    if (!profileBase) {
      throw new Error(`Profile for user ${user_id} not found in ${platform}`);
    }

    const profileCreate: AccountProfileCreate = {
      ...profileBase,
      platformId: platform,
    };

    const id = this.users.profiles.create(profileCreate, manager);
    return { id, ...profileCreate };
  }

  /** Get or create an account profile */
  async getOrCreateProfile<P = any>(
    profileId: string,
    manager: TransactionManager
  ) {
    const profile = await this.users.profiles.getByProfileId<false, P>(
      profileId,
      manager
    );

    if (!profile) {
      return this.createProfile<P>(profileId, manager);
    }

    return profile as P;
  }

  /** Get posts AppPostFull of user, cannot be part of a transaction
   * We trigger fetching posts from the platforms from here
   */
  async getOfUser(_queryParams: PostsQuery) {
    if (!_queryParams.userId) {
      throw new Error('userId is required');
    }

    const queryParams: PostsQuery = {
      status: PostsQueryStatus.DRAFTS,
      ..._queryParams,
    };

    const appPosts = await this.getAndFetchIfNecessary(queryParams);

    const postsFull = await Promise.all(
      appPosts.map((post) => this.appendMirrors(post))
    );

    logger.debug(
      `getOfUser query for user ${queryParams.userId} has ${appPosts.length} results for query params: `,
      { queryParams }
    );
    return postsFull;
  }

  /**
   * Append full mirrors to AppPost and return AppPostFull
   * */
  async appendMirrors(post: AppPost): Promise<AppPostFull> {
    const mirrors = await Promise.all(
      post.mirrorsIds.map((mirrorId) => {
        return this.db.run((manager) =>
          this.processing.platformPosts.get(mirrorId, manager)
        );
      })
    );

    return {
      ...post,
      mirrors: mirrors.filter((m) => m !== undefined) as PlatformPost[],
    };
  }

  async getPost<T extends boolean>(
    postId: string,
    shouldThrow?: T,
    manager?: TransactionManager
  ) {
    const func = async (manager: TransactionManager) => {
      const post = await this.processing.getPostFull(
        postId,
        manager,
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
          return this.processing.getPostFull(postId, manager, shouldThrow);
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
      await this.db.run(
        async (manager) => {
          try {
            await this._parsePost(postId, manager);
          } catch (err: any) {
            logger.error(`Error parsing post ${postId}`, err);
            await this.updatePost(
              postId,
              { parsingStatus: AppPostParsingStatus.ERRORED },
              manager
            );
          }
        },
        undefined,
        undefined,
        `parsePost - parsing ${postId}`
      );
    }
  }

  protected async _parsePost(postId: string, manager: TransactionManager) {
    const post = await this.processing.posts.get(postId, manager, true);
    if (DEBUG) logger.debug(`parsePost - start ${postId}`, { postId, post });

    const params: ParsePostRequest<TopicsParams> = {
      post: post.generic,
      parameters: {
        [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
      },
    };

    /** Call the parser */
    const parserResult = await this.parserService.parsePost(params);

    if (!parserResult) {
      throw new Error(`Error parsing post: ${post.id}`);
    }

    /** science filter hack */
    const reviewedStatus: AppPostReviewStatus = [
      SciFilterClassfication.AI_DETECTED_RESEARCH,
      SciFilterClassfication.CITOID_DETECTED_RESEARCH,
    ].includes(parserResult.filter_classification)
      ? AppPostReviewStatus.PENDING
      : AppPostReviewStatus.IGNORED;

    const update: PostUpdate = {
      semantics: parserResult.semantics,
      originalParsed: parserResult,
      parsedStatus: AppPostParsedStatus.PROCESSED,
      parsingStatus: AppPostParsingStatus.IDLE,
      reviewedStatus,
    };

    if (DEBUG) logger.debug(`parsePost - done ${postId}`, { postId, update });

    /** store the semantics and mark as processed */
    await this.updatePost(post.id, update, manager);
  }

  /** single place to update a post (it updates the drafts if necessary) */
  async updatePost(
    postId: string,
    postUpdate: PostUpdate,
    manager: TransactionManager
  ) {
    if (DEBUG) logger.debug(`updatePost ${postId}`, { postId, postUpdate });
    await this.processing.posts.update(postId, postUpdate, manager);

    try {
      if (DEBUG) logger.debug(`createOrUpdatePostDrafts ${postId}`);
      await this.processing.createOrUpdatePostDrafts(postId, manager);
    } catch (err: any) {
      logger.warn(`Error updating post drafts ${postId}`, err);
    }

    /** sync the semantics as triples when the post is updated */
    const postUpdated = await this.processing.posts.get(postId, manager, true);
    const structured = await this.processing.processSemantics(
      postId,
      manager,
      postUpdated.semantics
    );

    if (structured) {
      if (DEBUG)
        logger.debug(`updating strucured semantics ${postId}`, structured);
      await this.processing.posts.update(postId, { ...structured }, manager);
    }
  }

  /** deletes the mirror of a post from a platform. userId MUST be a verified user */
  async unpublishPlatformPost(
    postId: string,
    userId: string,
    platformId: PLATFORM,
    post_id: string
  ) {
    return this.db.run(async (manager) => {
      const user = await this.users.repo.getUser(userId, manager, true);
      const post = await this.processing.getPostFull(postId, manager, true);

      if (!post.authorUserId) {
        throw new Error(`Cannout publish post without author: ${post.id}`);
      }

      if (post.authorUserId !== userId) {
        throw new Error(`Only author can unpublish a post: ${post.id}`);
      }

      const mirror = PostsHelper.getPostMirror(
        post,
        { platformId, post_id },
        true
      );

      if (!mirror) {
        throw new Error(`Mirror on ${platformId} not found for post ${postId}`);
      }

      if (!mirror.posted) {
        throw new Error(
          `Mirror on ${platformId} not posted for post ${postId}`
        );
      }

      if (mirror.publishStatus !== PlatformPostPublishStatus.PUBLISHED) {
        throw new Error(`Mirror of ${postId} on ${platformId} not published`);
      }

      const account = UsersHelper.getAccount(
        user,
        mirror.platformId,
        mirror.posted.user_id,
        true
      );

      const platform = this.platforms.get(mirror.platformId);

      if (
        mirror.deleteDraft &&
        (mirror.deleteDraft.signerType === undefined ||
          mirror.deleteDraft.signerType === PlatformPostSignerType.DELEGATED) &&
        platform.signDraft
      ) {
        const signedPost = await platform.signDraft(mirror.deleteDraft);
        mirror.deleteDraft.signedPost = signedPost;
      }

      if (!mirror.deleteDraft || !mirror.deleteDraft.signedPost) {
        throw new Error(`Expected signed post to be provided`);
      }

      const { post: posted, credentials } = await platform.publish({
        draft: mirror.deleteDraft.signedPost,
        credentials: account.credentials,
      });

      if (credentials && userId) {
        await this.users.updateAccountCredentials(
          userId,
          mirror.platformId,
          account.user_id,
          credentials,
          manager
        );
      }

      /** update the platformPost */
      await this.processing.platformPosts.update(
        mirror.id,
        {
          posted: posted,
          publishOrigin: PlatformPostPublishOrigin.POSTED,
          publishStatus: PlatformPostPublishStatus.UNPUBLISHED,
          ...(mirror.post_id ? {} : { post_id: posted.post_id }),
        },
        manager
      );

      /** mark post (TODO: what about multiplatform?) */
      await this.updatePost(
        postId,
        {
          republishedStatus: AppPostRepublishedStatus.UNREPUBLISHED,
        },
        manager
      );
    });
  }

  /**
   * Approving a post receives an AppPostFull.
   * - The content and the semantics might have changed.
   * - The draft value on the mirrors array might have changed.
   *
   * The platformIds are the platforms where the post will be published
   * (or updated/republished)
   *
   * userId must be the authenticated user to prevent posting on
   * behalf of others.
   */
  async publishPost(
    newPost: AppPostFull,
    platformIds: PLATFORM[],
    manager?: TransactionManager,
    auto?: boolean,
    authenticatedUserId?: string // if authenticatedUserId is provided, it is verified
  ) {
    const publishFunction = async (manager: TransactionManager) => {
      if (DEBUG) logger.debug(`approvePost ${newPost.id}`, { post: newPost });

      const existingPost = await this.processing.posts.get(
        newPost.id,
        manager,
        true
      );

      if (!existingPost) {
        throw new Error(`Post not found: ${newPost.id}`);
      }

      if (!existingPost.authorUserId) {
        throw new Error(`Cannout publish post without author: ${newPost.id}`);
      }

      if (
        authenticatedUserId &&
        existingPost.authorUserId !== authenticatedUserId
      ) {
        throw new Error(`Only author can publish a post: ${newPost.id}`);
      }

      /** for now its either ignore all, or approve all */
      if (newPost.reviewedStatus === AppPostReviewStatus.IGNORED) {
        await this.updatePost(
          newPost.id,
          {
            reviewedStatus: AppPostReviewStatus.IGNORED,
          },
          manager
        );
        return;
      }

      /** set review status */
      const reviewedStatus =
        existingPost.republishedStatus !== AppPostRepublishedStatus.PENDING
          ? AppPostReviewStatus.UPDATED
          : AppPostReviewStatus.APPROVED;

      await this.updatePost(
        newPost.id,
        {
          reviewedStatus,
        },
        manager
      );

      if (DEBUG)
        logger.debug('approvePost - updateContent', {
          existing: existingPost,
          post: newPost,
        });

      /**
       * Force update the content and semantics. The updatePost method makes sure
       * the mirrors and triples are aligned with the post. So its safer to always
       * call it
       */
      await this.updatePost(
        newPost.id,
        {
          reviewedStatus: AppPostReviewStatus.APPROVED,
          generic: newPost.generic,
          semantics: newPost.semantics,
        },
        manager
      );

      /**
       * Get the full updated post with it's mirrors to make sure any semantic updates
       * are reflected in the mirrors (because of optimistic updates in the frontend).
       * We could additionally add some checks here to see if there is a difference
       * between the updated and newPost and handle that accordingly.
       */
      const updatedPostFull = await this.processing.getPostFull(
        newPost.id,
        manager,
        true
      );

      /** publish drafts */
      const published = await Promise.all(
        updatedPostFull.mirrors.map(async (mirror) => {
          if (platformIds.includes(mirror.platformId) && mirror.draft) {
            if (!existingPost.authorUserId) {
              throw new Error(
                `Cannout publish post without author: ${newPost.id}`
              );
            }

            const user = await this.users.repo.getUser(
              existingPost.authorUserId,
              manager,
              true
            );

            const account = UsersHelper.getAccount(
              user,
              mirror.platformId,
              mirror.draft.user_id,
              true
            );

            if (DEBUG)
              logger.debug('approvePost - publish mirror', { mirror, account });

            const platform = this.platforms.get(mirror.platformId);

            if (
              (mirror.draft.signerType === undefined ||
                mirror.draft.signerType === PlatformPostSignerType.DELEGATED) &&
              platform.signDraft
            ) {
              const signedPost = await platform.signDraft(mirror.draft);
              mirror.draft.signedPost = signedPost;
            }

            if (!mirror.draft.signedPost) {
              throw new Error(`Expected signed post to be provided`);
            }

            const { post: posted, credentials } = await platform.publish({
              draft: mirror.draft.signedPost,
              credentials: account.credentials,
            });

            if (credentials && authenticatedUserId) {
              await this.users.updateAccountCredentials(
                authenticatedUserId,
                mirror.platformId,
                account.user_id,
                credentials,
                manager
              );
            }

            const platformPostUpdate: PlatformPostStatusUpdate = {
              draft: mirror.draft,
              posted: posted,
              publishOrigin: PlatformPostPublishOrigin.POSTED,
              publishStatus: PlatformPostPublishStatus.PUBLISHED,
            };

            /** set the original post_id */
            if (!mirror.post_id && posted.post_id) {
              platformPostUpdate.post_id = posted.post_id;
            }

            if (DEBUG)
              logger.debug('approvePost - update platformPost', {
                platformPostId: mirror.id,
                platformPostUpdate,
              });

            /**  update platform post status and posted values*/
            await this.processing.platformPosts.update(
              mirror.id,
              platformPostUpdate,
              manager
            );

            return true;
          } else {
            /** unpublished are the mirrors that were not posted (or fetched) */
            return mirror.posted !== undefined;
          }
        })
      );

      /** if all mirrors where published */
      if (published.every((v) => v === true)) {
        const wasAuto = auto !== undefined ? auto : false;
        await this.updatePost(
          newPost.id,
          {
            republishedStatus: wasAuto
              ? AppPostRepublishedStatus.AUTO_REPUBLISHED
              : AppPostRepublishedStatus.REPUBLISHED,
          },
          manager
        );
      }
    };

    if (manager) {
      return publishFunction(manager);
    } else {
      return this.db.run((manager) => publishFunction(manager));
    }
  }
}

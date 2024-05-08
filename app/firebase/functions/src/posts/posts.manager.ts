import {
  ALL_PUBLISH_PLATFORMS,
  AppUser,
  FetchParams,
  FetchedDetails,
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
  PlatformPostDraftApprova,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostUpdate,
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { ParserService } from '../parser/parser.service';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsProcessing } from './posts.processing';

const DEBUG = true;

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
    protected parserService: ParserService
  ) {}

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll() {
    const users = await this.users.repo.getAll();

    /** Call fetch for each user */
    const posts = await Promise.all(
      users.map(async (user) =>
        this.fetchUser({ user, params: { expectedAmount: 10 } })
      )
    );

    return posts.flat();
  }

  private async fetchUserFromPlatform(
    platformId: PLATFORM,
    params: FetchParams,
    account: UserDetailsBase,
    manager: TransactionManager
  ) {
    /** This fetch parameters */
    const userParams = ((): FetchParams => {
      if (params.sinceId) {
        return {
          sinceId: params.sinceId,
          expectedAmount: params.expectedAmount,
        };
      }

      if (params.untilId) {
        return {
          sinceId: params.untilId,
          expectedAmount: params.expectedAmount,
        };
      }

      /**
       * if no parameters are provided, if user has
       * newestId, fetch forward since then, if not
       * fetch without parameters (which is equivalent to
       * latest backwards)
       */

      if (account.fetched?.newestId) {
        return {
          sinceId: account.fetched?.newestId,
          expectedAmount: params.expectedAmount,
        };
      }

      return {
        expectedAmount: params.expectedAmount,
      };
    })();

    const fetched = await this.platforms.fetch(
      platformId,
      userParams,
      account,
      manager
    );

    if (DEBUG)
      logger.debug(
        `fetchUser - platformPosts: ${fetched.platformPosts.length}`,
        {
          fetched,
        }
      );

    /** keep track of the newest and oldest posts */
    const newFetchedDetails: FetchedDetails = {};

    if (userParams.untilId && fetched.fetched.oldestId) {
      newFetchedDetails.oldestId = fetched.fetched.oldestId;
    }

    if (userParams.sinceId && fetched.fetched.newestId) {
      newFetchedDetails.newestId = fetched.fetched.newestId;
    }

    if (!userParams.sinceId && !userParams.untilId) {
      newFetchedDetails.newestId = fetched.fetched.newestId;
      newFetchedDetails.oldestId = fetched.fetched.oldestId;
    }

    await this.users.repo.setAccountFetched(
      platformId,
      account.user_id,
      newFetchedDetails,
      manager
    );

    /** convert them into a PlatformPost */
    return fetched.platformPosts.map((fetchedPost) => {
      const platformPost: PlatformPostCreate = {
        platformId: platformId as PUBLISHABLE_PLATFORMS,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
        posted: fetchedPost,
      };

      return platformPost;
    });
  }

  /**
   * Fetch and store platform posts of one user
   * in one Transaction.
   *
   * if mode === 'forward' fetches from the newset fetched date
   * if mode === 'backwards' fetches from the oldest fetched date
   * */
  async fetchUser(
    inputs: {
      userId?: string;
      user?: AppUser;
      params: FetchParams;
    },
    _manager?: TransactionManager
  ) {
    const fetch = async (manager: TransactionManager): Promise<void> => {
      const user =
        inputs.user ||
        (await this.users.repo.getUser(inputs.userId as string, manager, true));

      if (DEBUG) logger.debug('fetchUser', { user });

      await Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platformId) => {
          const accounts = UsersHelper.getAccounts(user, platformId);
          /** Call fetch for each account */
          return Promise.all(
            accounts.map(
              async (account): Promise<PlatformPostCreated[] | undefined> => {
                /** Fetch */
                try {
                  if (DEBUG)
                    logger.debug('fetchUser - fetchAccount', {
                      platformId,
                    });

                  const platformPostsCreate = await this.fetchUserFromPlatform(
                    platformId,
                    inputs.params,
                    account,
                    manager
                  );

                  /** Create the PlatformPosts */
                  const platformPostsCreated =
                    await this.processing.createPlatformPosts(
                      platformPostsCreate,
                      manager
                    );

                  if (DEBUG)
                    logger.debug(
                      `fetchUser - platformPostsCreated: ${platformPostsCreated.length}`,
                      {
                        platformPostsCreated,
                      }
                    );

                  return platformPostsCreated;
                } catch (err: any) {
                  logger.error(
                    `Error fetching posts for user ${user.userId} on platform ${platformId}`,
                    err
                  );
                  throw new Error(err.message);
                }
              }
            )
          );
        })
      );
    };

    /** can be called as part of a transaction or independently */
    if (_manager) {
      return fetch(_manager);
    }
    return this.db.run((manager) => fetch(manager));
  }

  async parseOfUser(userId: string) {
    const postIds = await this.processing.posts.getNonParsedOfUser(userId);
    await Promise.all(postIds.map((postId) => this.markAndParsePost(postId)));
  }

  /** get AppPost and fetch for new posts if necessary */
  private async getAndFetchIfNecessary(
    userId: string,
    queryParams: UserPostsQueryParams
  ) {
    /** if sinceId is provided fetch forward always */
    if (queryParams.fetchParams.sinceId !== undefined) {
      /** fetch platforms for new PlatformPosts */
      await this.fetchUser({ userId, params: queryParams.fetchParams });
      return this.processing.posts.getOfUser(userId, queryParams);
    } else {
      /** if untilId fetch backwards but only if not enough posts are already stored */
      const appPosts = await this.processing.posts.getOfUser(
        userId,
        queryParams
      );

      if (
        queryParams.status === PostsQueryStatusParam.ALL ||
        queryParams.status === PostsQueryStatusParam.PENDING
      ) {
        if (appPosts.length < queryParams.fetchParams.expectedAmount) {
          await this.fetchUser({ userId, params: queryParams.fetchParams });
          return this.processing.posts.getOfUser(userId, queryParams);
        }
      }
      return appPosts;
    }
  }

  /** Get posts AppPostFull of user, cannot be part of a transaction
   * We trigger fetching posts from the platforms from here
   */
  async getOfUser(userId: string, _queryParams?: UserPostsQueryParams) {
    const queryParams: UserPostsQueryParams = {
      fetchParams: { expectedAmount: 10 },
      status: PostsQueryStatusParam.ALL,
      ..._queryParams,
    };

    const appPosts = await this.getAndFetchIfNecessary(userId, queryParams);
    const postsFull = await Promise.all(
      appPosts.map((post) => this.appendMirrors(post))
    );

    logger.debug(
      `getOfUser query for user ${userId} has ${appPosts.length} results for query params: `,
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

  async getPost<T extends boolean>(postId: string, shouldThrow: T) {
    return this.db.run(async (manager) =>
      this.processing.getPostFull(postId, manager, shouldThrow)
    );
  }

  async markAndParsePost(postId: string) {
    const shouldParse = await this.db.run(async (manager) => {
      const post = await this.processing.posts.get(postId, manager, true);
      if (post.parsingStatus === 'processing') {
        logger.debug(`parseOfUser - already parsing ${postId}`);
        return false;
      }

      logger.debug(`parseOfUser - marking as parsing ${postId}`);
      await this.processing.posts.updateContent(
        postId,
        { parsingStatus: AppPostParsingStatus.PROCESSING },
        manager
      );

      return true;
    });

    if (shouldParse) {
      /** then process */
      await this.db.run(async (manager) => {
        try {
          await this.parsePost(postId, manager);
          await this.processing.createPostDrafts(postId, manager);
        } catch (err: any) {
          logger.error(`Error parsing post ${postId}`, err);
          await this.processing.posts.updateContent(
            postId,
            { parsingStatus: AppPostParsingStatus.ERRORED },
            manager
          );
        }
      });
    }
  }

  protected async parsePost(postId: string, manager: TransactionManager) {
    const post = await this.processing.posts.get(postId, manager, true);
    if (DEBUG) logger.debug('parsePost - start', { postId, post });

    const params: ParsePostRequest<TopicsParams> = {
      post: { content: post.content },
      parameters: {
        [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
      },
    };

    /** Call the parser */
    const parserResult = await this.parserService.parsePost(params);

    if (!parserResult) {
      throw new Error(`Error parsing post: ${post.id}`);
    }

    const update: PostUpdate = {
      semantics: parserResult.semantics,
      originalParsed: parserResult,
      parsedStatus: AppPostParsedStatus.PROCESSED,
      parsingStatus: AppPostParsingStatus.IDLE,
    };

    if (DEBUG) logger.debug('parsePost - done', { postId, update });

    await this.processing.posts.updateContent(post.id, update, manager);
  }

  /**
   * Approving a post receives an AppPostFull.
   * - The content and the semantics might have changed.
   * - The draft value on the mirrors array might have changed.
   *
   * userId must be the authenticated user to prevent posting on
   * behalf of others.
   */
  async approvePost(post: AppPostFull, userId: string) {
    await this.db.run(async (manager) => {
      if (DEBUG) logger.debug('approvePost', { post, userId });
      const user = await this.users.repo.getUser(userId, manager, true);
      const existing = await this.processing.posts.get(post.id, manager, true);
      if (!existing) {
        throw new Error(`Post not found: ${post.id}`);
      }

      if (existing.authorId !== userId) {
        throw new Error(`Only the author can approve a post: ${post.id}`);
      }

      /** for now its either ignore all, or approve all */
      if (post.reviewedStatus === AppPostReviewStatus.IGNORED) {
        await this.processing.posts.updateContent(
          post.id,
          {
            reviewedStatus: AppPostReviewStatus.IGNORED,
          },
          manager
        );
        return;
      }

      /** else mark as approved */

      /** force status transition */
      await this.processing.posts.updateContent(
        post.id,
        {
          reviewedStatus: AppPostReviewStatus.APPROVED,
        },
        manager
      );

      /** check if content or semantics changed (other changes are not expected and omited) */
      if (
        existing.content !== post.content ||
        existing.semantics !== post.semantics
      ) {
        if (DEBUG)
          logger.debug('approvePost - updateContent', { existing, post });
        await this.processing.posts.updateContent(
          post.id,
          {
            reviewedStatus: AppPostReviewStatus.APPROVED,
            content: post.content,
            semantics: post.semantics,
          },
          manager
        );
      }

      /** publish approved drafts */
      const published = await Promise.all(
        post.mirrors.map(async (mirror) => {
          if (
            mirror.draft &&
            mirror.draft.postApproval === PlatformPostDraftApprova.APPROVED
          ) {
            const account = UsersHelper.getAccount(
              user,
              mirror.platformId,
              mirror.draft.user_id,
              true
            );

            if (DEBUG)
              logger.debug('approvePost - publish mirror', { mirror, account });

            const posted = await this.platforms
              .get(mirror.platformId)
              .publish(
                { draft: mirror.draft.post, userDetails: account },
                manager
              );

            await this.processing.platformPosts.updatePosted(
              mirror.id,
              {
                draft: mirror.draft,
                posted: posted,
                publishOrigin: PlatformPostPublishOrigin.POSTED,
                publishStatus: PlatformPostPublishStatus.PUBLISHED,
              },
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
        await this.processing.posts.updateContent(
          post.id,
          {
            republishedStatus: AppPostRepublishedStatus.REPUBLISHED,
          },
          manager
        );
      }
    });
  }
}

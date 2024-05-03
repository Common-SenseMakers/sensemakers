import { ALL_PUBLISH_PLATFORMS, AppUser } from '../@shared/types/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import {
  PlatformPost,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { AppPost, AppPostFull, PostUpdate } from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { ParserService } from '../parser/parser.service';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
import { PlatformsService } from '../platforms/platforms.service';
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
      users.map(async (user) => this.fetchUser(undefined, user))
    );

    return posts.flat();
  }

  /**
   * Fetch and store platform posts of one user
   * as one Transaction.
   * */
  async fetchUser(
    userId?: string,
    _user?: AppUser,
    _manager?: TransactionManager
  ) {
    const fetch = async (manager: TransactionManager): Promise<void> => {
      const user =
        _user ||
        (await this.users.repo.getUser(userId as string, manager, true));
      if (DEBUG) logger.debug('fetchUser', { user });

      await Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platformId) => {
          const accounts = UsersHelper.getAccounts(user, platformId);
          /** Call fetch for each account */
          return Promise.all(
            accounts.map(
              async (account): Promise<PlatformPostCreated[] | undefined> => {
                /** This fetch parameters */
                const userParams: FetchUserPostsParams = {
                  start_time: account.read
                    ? account.read.lastFetchedMs
                    : account.signupDate,
                  userDetails: account,
                  max_results: 3,
                };

                /** Fetch */
                try {
                  if (DEBUG)
                    logger.debug('fetchUser - fetchAccount', {
                      platformId,
                      userParams,
                    });

                  const platformPosts = await this.platforms.fetch(
                    platformId,
                    userParams,
                    manager
                  );

                  if (DEBUG)
                    logger.debug('fetchUser - platformPosts', {
                      platformPosts,
                    });

                  /** Create the PlatformPosts */
                  const platformPostsCreated =
                    await this.processing.createPlatformPosts(
                      platformPosts,
                      manager
                    );

                  if (DEBUG)
                    logger.debug('fetchUser - platformPostsCreated', {
                      platformPostsCreated,
                    });

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

    await Promise.all(
      postIds.map(async (postId) => {
        /**
         * check if not being processed
         * mark as being processed
         * commit transaction */
        const shouldParse = await this.db.run(async (manager) => {
          const post = await this.processing.posts.get(postId, manager, true);
          if (post.parsingStatus === 'processing') {
            logger.debug(`parseOfUser - already parsing ${postId}`);
            return false;
          }

          logger.debug(`parseOfUser - marking as parsing ${postId}`);
          await this.processing.posts.updateContent(
            postId,
            { parsingStatus: 'processing' },
            manager
          );

          return true;
        });

        if (shouldParse) {
          /** then process */
          await this.db.run(async (manager) => {
            await this.parsePost(postId, manager);
            await this.processing.createPostsDrafts(postIds, manager);
          });
        }
      })
    );
  }

  /** get pending posts AppPostFull of user, cannot be part of a transaction */
  async getOfUser(userId: string) {
    const pendingAppPosts = await this.processing.posts.getOfUser(userId);

    const postsFull = await Promise.all(
      pendingAppPosts.map((post) => this.appendMirrors(post))
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

  async parsePosts(postIds: string[], manager: TransactionManager) {
    return Promise.all(
      postIds.map((postId) => this.parsePost(postId, manager))
    );
  }

  async parsePost(postId: string, manager: TransactionManager) {
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
      parsedStatus: 'processed',
      parsingStatus: 'idle',
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

      /** force status transition */
      await this.processing.posts.updateContent(
        post.id,
        {
          reviewedStatus: 'reviewed',
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
            reviewedStatus: 'reviewed',
            content: post.content,
            semantics: post.semantics,
          },
          manager
        );
      }

      /** publish approved drafts */
      await Promise.all(
        post.mirrors.map(async (mirror) => {
          if (mirror.draft && mirror.draft.postApproval === 'approved') {
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
                publishOrigin: 'posted',
                publishStatus: 'published',
              },
              manager
            );
          }
        })
      );
    });
  }
}

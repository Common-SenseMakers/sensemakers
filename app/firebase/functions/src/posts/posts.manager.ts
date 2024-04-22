import { TransactionManager } from 'src/db/transaction.manager';

import { ALL_PUBLISH_PLATFORMS, AppUser } from '../@shared/types/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import { PlatformPost } from '../@shared/types/types.platform.posts';
import { AppPostFull, PostUpdate } from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { ParserService } from '../parser/parser.service';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsProcessing } from './posts.processing';

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
   * as one Transaction. It doesn't return anything.
   * */
  async fetchUser(
    userId?: string,
    _user?: AppUser,
    _manager?: TransactionManager
  ) {
    const func = async (manager: TransactionManager) => {
      const user =
        _user ||
        (await this.users.repo.getUser(userId as string, manager, true));

      await Promise.all(
        ALL_PUBLISH_PLATFORMS.map(async (platformId) => {
          const accounts = UsersHelper.getAccounts(user, platformId);
          /** Call fetch for each account */
          return Promise.all(
            accounts.map(async (account) => {
              /** This fetch parameters */
              const userParams: FetchUserPostsParams = {
                start_time: account.read
                  ? account.read.lastFetchedMs
                  : account.signupDate,
                userDetails: account,
                max_results: 10,
              };

              /** Fetch */
              const platformPosts = await this.platforms.fetch(
                platformId,
                userParams,
                manager
              );

              /** Create the PlatformPosts */
              const platformPostsCreated =
                await this.processing.createPlatformPosts(
                  platformPosts,
                  manager
                );

              const postIds = platformPostsCreated.map((pp) => pp.post.id);
              await this.parsePosts(postIds, manager);

              /** Create the Drafts */
              await this.processing.createPostsDrafts(
                postIds,
                ALL_PUBLISH_PLATFORMS.filter(
                  (_platformId) => _platformId !== platformId
                ),
                manager
              );

              return platformPostsCreated;
            })
          );
        })
      );
    };

    if (_manager) return func(_manager);
    return this.db.run((manager) => func(manager));
  }

  /** get pending posts AppPostFull of user, cannot be part of a transaction */
  async getPendingOfUser(userId: string) {
    const pendingAppPosts =
      await this.processing.posts.getPendingOfUser(userId);

    const postsFull = await Promise.all(
      pendingAppPosts.map(async (post): Promise<AppPostFull> => {
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
      })
    );

    return postsFull;
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
      parseStatus: 'processed',
    };

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
      const user = await this.users.repo.getUser(userId, manager, true);
      const existing = await this.processing.posts.get(post.id, manager, true);
      if (!existing) {
        throw new Error(`Post not found: ${post.id}`);
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

            const posted = await this.platforms
              .get(mirror.platformId)
              .publish(
                { draft: mirror.draft.post, userDetails: account },
                manager
              );

            await this.processing.platformPosts.updatePosted(
              mirror.id,
              {
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

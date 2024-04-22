import { TransactionManager } from 'src/db/transaction.manager';

import { ALL_PUBLISH_PLATFORMS, AppUser } from '../@shared/types/types';
import { PlatformPost } from '../@shared/types/types.platform.posts';
import { AppPostFull } from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
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
    protected platforms: PlatformsService
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
   * as one Transaction. It doesn't return anything
   * Could be modified to return the PlatformPosts fetched,
   * and the corresponding AppPosts and Drafts
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

              /** Create the Drafts */
              await this.processing.createPostsDrafts(
                platformPostsCreated.map((pp) => pp.post.id),
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
}

import { ALL_PUBLISH_PLATFORMS, PLATFORM } from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
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
    return this.db.run(async (manager) => {
      const users = await this.users.repo.getAll();
      const params: Map<PLATFORM, FetchUserPostsParams[]> = new Map();

      /**
       * prepare the credentials and lastFetched timestamps for
       * all users and platforms
       */
      users.forEach((user) => {
        ALL_PUBLISH_PLATFORMS.map((platformId) => {
          /** check if the user has credentials for that platform */
          const account = UsersHelper.getAccount(user, platformId);
          if (account) {
            const current = params.get(platformId) || [];
            const thisParams: FetchUserPostsParams = {
              start_time: account.read
                ? account.read.lastFetchedMs
                : account.signupDate,
              userDetails: account,
            };

            current.push(thisParams);
            params.set(platformId, current);
          }
        });
      });

      /** Call fetch for each user and platform */
      const allPosts = await Promise.all(
        Array.from(params.entries()).map(
          async ([platformId, allUsersParams]) => {
            /** each fetch is a different transaction */
            const allUsersPosts = await Promise.all(
              allUsersParams.map((userParams) =>
                this.platforms.fetch(platformId, userParams, manager)
              )
            );
            return allUsersPosts.flat();
          }
        )
      );

      /** fetch all new posts from all platforms */
      const platformPosts = allPosts.flat();

      /** Create the PlatformPosts (and the AppPosts) */
      const created = await this.storePlatformPosts(platformPosts, manager);

      return created.filter((p) => p !== undefined) as PlatformPostCreated[];
    });
  }

  /** Store all platform posts (can use an existing TransactionManager or create new one) */
  async storePlatformPosts(
    platformPosts: PlatformPostCreate[],
    manager: TransactionManager
  ) {
    return await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.processing.createPlatformPost(platformPost, manager);
      })
    );
  }

  /** get paginated pending posts of user */
  async getPendingOfUser(userId: string) {
    const results = await this.db.run(async (manager) => {
      return this.processing.posts.getPendingOfUser(userId);
    });

    return results;
  }
}

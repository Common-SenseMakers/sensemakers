import { ALL_PUBLISH_PLATFORMS } from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import {
  HandleWithTransactionManager,
  ManagerModes,
  TransactionManager,
} from '../db/transaction.manager';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
import { PlatformsService } from '../platforms/platforms.service';
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
    protected processing: PostsProcessing,
    protected platforms: PlatformsService
  ) {}

  /** run function with manager or create one */
  private run<P, R>(
    func: HandleWithTransactionManager<P, R>,
    payload: P,
    manager?: TransactionManager
  ): Promise<R> {
    if (manager) {
      return func(payload, manager);
    } else {
      return this.db.runWithTransactionManager(func, payload, {
        mode: ManagerModes.TRANSACTION,
      });
    }
  }

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll(_manager?: TransactionManager) {
    const func: HandleWithTransactionManager<
      undefined,
      (PlatformPostCreated | undefined)[]
    > = async (payload, manager) => {
      const users = await this.users.repo.getAll();
      const params = new Map();

      /**
       * prepare the credentials and lastFetched timestamps for
       * all users and platforms
       */
      users.forEach((user) => {
        ALL_PUBLISH_PLATFORMS.map((platformId) => {
          /** check if the user has credentials for that platform */
          const accounts = user[platformId];
          if (accounts) {
            accounts.forEach((account) => {
              const current = params.get(platformId) || [];
              const thisParams: FetchUserPostsParams = {
                start_time: account.read
                  ? account.read.lastFetchedMs
                  : account.signupDate,
                userDetails: account,
              };
              params.set(platformId, current.concat(thisParams));
            });
          }
        });
      });

      /** Call fetch for each user and platform */
      const allPosts = await Promise.all(
        Array.from(params.keys()).map(async (platformId) => {
          const thisParams = params.get(platformId);
          if (thisParams) {
            return this.platforms.fetch(platformId, thisParams);
          } else {
            return [];
          }
        })
      );

      /** fetch all new posts from all platforms */
      const platformPosts = allPosts.flat();

      /** Create the PlatformPosts (and the AppPosts) */
      const created = await this.storePlatformPosts(platformPosts);

      return created;
    };

    return this.run(func, undefined, _manager);
  }

  /** Store all platform posts (can use an existing TransactionManager or create new one) */
  async storePlatformPosts(
    platformPosts: PlatformPostCreate[],
    _manager?: TransactionManager
  ) {
    const func: HandleWithTransactionManager<
      undefined,
      Array<PlatformPostCreated | undefined>
    > = async (payload, manager) => {
      return await Promise.all(
        platformPosts.map(async (platformPost) => {
          return await this.processing.createPlatformPost(
            platformPost,
            manager
          );
        })
      );
    };

    return this.run(func, undefined, _manager);
  }
}

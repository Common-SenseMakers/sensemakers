import { ALL_PUBLISH_PLATFORMS, PLATFORM } from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { DBInstance } from '../db/instance';
import {
  HandleWithTxManager,
  ManagerModes,
  TransactionManager,
} from '../db/transaction.manager';
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

  /** run function with manager or create one */
  private run<R, P>(
    func: HandleWithTxManager<R, P>,
    manager?: TransactionManager,
    payload?: P
  ): Promise<R> {
    if (manager) {
      return func(manager, payload);
    } else {
      return this.db.run(func, payload, {
        mode: ManagerModes.TRANSACTION,
      });
    }
  }

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll(_manager?: TransactionManager) {
    const func: HandleWithTxManager<PlatformPostCreated[], undefined> = async (
      manager
    ) => {
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
    };

    return this.run(func, _manager);
  }

  /** Store all platform posts (can use an existing TransactionManager or create new one) */
  async storePlatformPosts(
    platformPosts: PlatformPostCreate[],
    _manager?: TransactionManager
  ) {
    const func: HandleWithTxManager<
      Array<PlatformPostCreated | undefined>,
      undefined
    > = async (manager) => {
      return await Promise.all(
        platformPosts.map(async (platformPost) => {
          return await this.processing.createPlatformPost(
            platformPost,
            manager
          );
        })
      );
    };

    return this.run(func, _manager);
  }
}

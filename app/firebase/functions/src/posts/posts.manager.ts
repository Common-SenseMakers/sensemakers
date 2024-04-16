import { AppPostFull } from 'src/@shared/types/types.posts';

import { ALL_PUBLISH_PLATFORMS, AppUser } from '../@shared/types/types';
import {
  PlatformPost,
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
    const users = await this.users.repo.getAll();

    /** Call fetch for each user */
    const posts = await Promise.all(
      users.map(async (user) => this.fetchUser(user))
    );

    return posts.flat();
  }

  /**
   * Fetch and store platform posts of one user
   * as one Transaction
   * */
  async fetchUser(user: AppUser) {
    /** Call fetch for each platform */
    return this.db.run(async (manager) => {
      const _userPlatformPosts = await Promise.all(
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
              };

              /** Fetch */
              const platformPosts = await this.platforms.fetch(
                platformId,
                userParams,
                manager
              );

              /** Store */
              const platformPostsCreated = await this.storePlatformPosts(
                user,
                platformPosts,
                manager
              );

              return platformPostsCreated;
            })
          );
        })
      );

      return _userPlatformPosts
        .flat(2)
        .filter((p) => p !== undefined) as PlatformPostCreated[];
    });
  }

  /** Store all platform posts */
  async storePlatformPosts(
    user: AppUser,
    platformPosts: PlatformPostCreate[],
    manager: TransactionManager
  ) {
    return await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.processing.createPlatformPost(
          user,
          platformPost,
          manager
        );
      })
    );
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
      this.processing.getPost(postId, manager, shouldThrow)
    );
  }
}

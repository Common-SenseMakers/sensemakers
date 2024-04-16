import {
  ALL_PUBLISH_PLATFORMS,
  AppUser,
  DefinedIfTrue,
  PUBLISHABLE_PLATFORMS,
} from '../@shared/types/types';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostCreate,
  AppPostFull,
} from '../@shared/types/types.posts';
import { TransactionManager } from '../db/transaction.manager';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { getPrefixedUserId } from '../users/users.utils';
import { PlatformPostsRepository } from './platform.posts.repository';
import { PostsRepository } from './posts.repository';

/**
 * Per-PlatformPost or Per-AppPost methods.
 * They operate over a TransactionManager
 */
export class PostsProcessing {
  constructor(
    protected users: UsersService,
    public posts: PostsRepository,
    public platformPosts: PlatformPostsRepository,
    protected platforms: PlatformsService
  ) {}

  /**
   * Checks if a PlatformPost exist and creates it if not. It also creates an AppPost
   * */
  async createPlatformPost(
    user: AppUser,
    platformPost: PlatformPostCreate,
    manager: TransactionManager
  ): Promise<PlatformPostCreated | undefined> {
    const existing = platformPost.posted
      ? await this.platformPosts.getFrom_post_id(
          platformPost.posted.post_id,
          manager
        )
      : undefined;

    if (existing) {
      return undefined;
    }

    /** if a platformPost does not exist (most likely scenario) then create a new AppPost for this PlatformPost */
    const { content } = await this.platforms.convertToGeneric(platformPost);

    /** user_id might be defined or the intended one */
    const user_id = platformPost.posted
      ? platformPost.posted.user_id
      : platformPost.draft?.user_id;

    if (!user_id) {
      throw new Error(
        `Cannot create a post associated to a PlatformPost that does not have a draft or a posted`
      );
    }

    const platformPostCreated = this.platformPosts.create(
      platformPost,
      manager
    );

    /** create AppPost */
    const post = await this.createAppPost(
      {
        origin: platformPost.platformId,
        authorId: getPrefixedUserId(platformPost.platformId, user_id),
        content,
        mirrorsIds: [platformPostCreated.id],
      },
      user,
      ALL_PUBLISH_PLATFORMS.filter(
        (platformId) => platformId !== platformPost.platformId
      ),
      manager
    );

    return { post, platformPost: platformPostCreated };
  }

  async createAppPost(
    input: Omit<AppPostCreate, 'parseStatus' | 'reviewedStatus'>,
    user: AppUser,
    draftsPlatforms: PUBLISHABLE_PLATFORMS[],
    manager: TransactionManager
  ): Promise<AppPost> {
    /** Build the AppPostFull object */
    const postCreate: AppPostCreate = {
      ...input,
      parseStatus: 'unprocessed',
      reviewedStatus: 'pending',
    };

    /** Create the post */
    const post = this.posts.create(postCreate, manager);

    /**
     * Create platformPosts as drafts on all platforms
     * */
    await Promise.all(
      draftsPlatforms.map(async (platformId) => {
        if (platformId !== post.origin) {
          const accounts = UsersHelper.getAccounts(user, platformId);
          await Promise.all(
            accounts.map(async (account) => {
              /** create a draft for that platform and account */
              const postFull = await this.getPost(post.id, manager, true);
              this.platforms
                .get(platformId)
                .convertFromGeneric({ post: postFull, author: user });

              const draft: PlatformPostCreate = {
                platformId,
                publishStatus: 'draft',
                publishOrigin: 'posted',
                draft: {
                  postApproval: 'pending',
                  user_id: account.user_id,
                  post: postFull,
                },
              };

              this.platformPosts.create(draft, manager);
            })
          );
        }
      })
    );

    return post;
  }

  /** get AppPostFull */
  async getPost<T extends boolean, R = AppPostFull>(
    postId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, shouldThrow);

    if (!post && shouldThrow) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post) {
      return undefined as DefinedIfTrue<T, R>;
    }

    const mirrors = await Promise.all(
      post.mirrorsIds.map((mirrorId) =>
        this.platformPosts.get(mirrorId, manager)
      )
    );

    return {
      ...post,
      mirrors: mirrors.filter((m) => m !== undefined) as PlatformPost[],
    } as unknown as DefinedIfTrue<T, R>;
  }
}

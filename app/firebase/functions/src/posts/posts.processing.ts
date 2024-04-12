import {
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { AppPost, AppPostCreate } from '../@shared/types/types.posts';
import { TransactionManager } from '../db/transaction.manager';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersService } from '../users/users.service';
import { getPrefixedUserId } from '../users/users.utils';
import { PlatformPostaRepository } from './platform.posts.repository';
import { PostsRepository } from './posts.repository';

/**
 * Per-PlatformPost or Per-AppPost methods.
 * They operate over a TransactionManager
 */
export class PostsProcessing {
  constructor(
    protected users: UsersService,
    protected posts: PostsRepository,
    protected platformPosts: PlatformPostaRepository,
    protected platforms: PlatformsService
  ) {}

  /**
   * Checks if a PlatformPost exist and creates it if not. It also creates an AppPost
   * */
  async createPlatformPost(
    platformPost: PlatformPostCreate,
    manager: TransactionManager
  ): Promise<PlatformPostCreated | undefined> {
    const existing = platformPost.posted
      ? await this.platformPosts.getFromPostId(
          platformPost.posted.post_id,
          manager
        )
      : undefined;

    if (existing) {
      return undefined;
    }

    /** if a platformPost does not exist (must likely scenario) then create a new AppPost for this PlatformPost */
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
    const post = this.createAppPost(
      {
        origin: platformPost.platformId,
        authorId: getPrefixedUserId(platformPost.platformId, user_id),
        content,
        mirrorsIds: [platformPostCreated.id],
      },
      manager
    );

    return { post, platformPost: platformPostCreated };
  }

  createAppPost(
    input: Omit<AppPostCreate, 'parseStatus' | 'reviewedStatus'>,
    manager: TransactionManager
  ): AppPost {
    /**
     * Derive AppPost GenericPostData
     * */

    /** Build the AppPostFull object */
    const post: AppPostCreate = {
      ...input,
      parseStatus: 'unprocessed',
      reviewedStatus: 'pending',
    };

    return this.posts.create(post, manager);
  }
}

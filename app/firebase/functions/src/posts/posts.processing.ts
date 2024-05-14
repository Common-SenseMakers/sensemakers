import { ALL_PUBLISH_PLATFORMS, DefinedIfTrue } from '../@shared/types/types';
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
  AppPostCreate,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
} from '../@shared/types/types.posts';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { PlatformsService } from '../platforms/platforms.service';
import { TimeService } from '../time/time.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { getPrefixedUserId } from '../users/users.utils';
import { PlatformPostsRepository } from './platform.posts.repository';
import { PostsRepository } from './posts.repository';

const DEBUG = false;

/**
 * Per-PlatformPost or Per-AppPost methods.
 * They operate over a TransactionManager
 */
export class PostsProcessing {
  constructor(
    protected users: UsersService,
    private time: TimeService,
    public posts: PostsRepository,
    public platformPosts: PlatformPostsRepository,
    protected platforms: PlatformsService
  ) {}

  /**
   * Checks if a PlatformPost exist and creates it if not.
   * It also creates an AppPost for that PlatformPost
   * */
  async createPlatformPost(
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
        createdAtMs: platformPost.posted?.timestampMs || this.time.now(),
      },
      manager
    );

    /** set the postId of the platformPost */
    this.platformPosts.setPostId(platformPostCreated.id, post.id, manager);

    return { post, platformPost: platformPostCreated };
  }

  /** Store all platform posts */
  async createPlatformPosts(
    platformPosts: PlatformPostCreate[],
    manager: TransactionManager
  ) {
    const postsCreated = await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.createPlatformPost(platformPost, manager);
      })
    );

    return postsCreated.filter((p) => p !== undefined) as PlatformPostCreated[];
  }

  /** Create and store all platform posts for one post */
  async createOrUpdatePostDrafts(postId: string, manager: TransactionManager) {
    const appPostFull = await this.getPostFull(postId, manager, true);

    const user = await this.users.repo.getUser(
      appPostFull.authorId,
      manager,
      true
    );

    const publishedPlatforms = appPostFull.mirrors
      .filter((m) => m.publishStatus === 'published')
      .map((m) => m.platformId);

    const pendingPlatforms = ALL_PUBLISH_PLATFORMS.filter(
      (p) => !publishedPlatforms.includes(p)
    );

    if (DEBUG)
      logger.debug('createPostDrafts', {
        appPostFull,
        user,
        publishedPlatforms,
        pendingPlatforms,
      });

    /**
     * Create platformPosts as drafts on all platforms
     * */
    const drafts = await Promise.all(
      pendingPlatforms.map(async (platformId) => {
        const accounts = UsersHelper.getAccounts(user, platformId);

        if (DEBUG)
          logger.debug('createPostDrafts - accounts', {
            accounts,
          });

        return Promise.all(
          accounts.map(async (account) => {
            /** create/update the draft for that platform and account */
            const draftPost = await this.platforms
              .get(platformId)
              .convertFromGeneric({ post: appPostFull, author: user });

            const draft: PlatformPostCreate = {
              platformId,
              publishStatus: PlatformPostPublishStatus.DRAFT,
              publishOrigin: PlatformPostPublishOrigin.POSTED,
              draft: {
                postApproval: PlatformPostDraftApprova.PENDING,
                user_id: account.user_id,
                post: draftPost.post,
              },
            };

            if (DEBUG)
              logger.debug('createPostDrafts- account', {
                draftPost,
                account,
              });

            const existing = await this.platformPosts.getFromPostId(
              postId,
              platformId,
              account.user_id,
              manager
            );

            if (!existing) {
              /** create and add as mirror */
              const plaformPost = this.platformPosts.create(draft, manager);
              if (DEBUG)
                logger.debug('createPostDrafts- addMirror', {
                  postId,
                  plaformPost,
                });

              this.posts.addMirror(postId, plaformPost.id, manager);
            }
          })
        );
      })
    );

    /** add drafts as post mirrors */

    return drafts.flat();
  }

  async createAppPost(
    input: Omit<
      AppPostCreate,
      'parsingStatus' | 'parsedStatus' | 'reviewedStatus' | 'republishedStatus'
    >,
    manager: TransactionManager
  ): Promise<AppPost> {
    /** Build the AppPostFull object */
    const postCreate: AppPostCreate = {
      ...input,
      parsedStatus: AppPostParsedStatus.UNPROCESSED,
      parsingStatus: AppPostParsingStatus.IDLE,
      reviewedStatus: AppPostReviewStatus.PENDING,
      republishedStatus: AppPostRepublishedStatus.PENDING,
    };

    /** Create the post */
    const post = this.posts.create(postCreate, manager);
    return post;
  }

  /** get AppPostFull */
  async getPostFull<T extends boolean, R = AppPostFull>(
    postId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, manager, shouldThrow);

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
